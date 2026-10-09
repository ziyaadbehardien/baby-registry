/**
 * Fetches a shop's product page and extracts the product photo (og:image / twitter:image /
 * JSON-LD Product image) and title.
 *
 * Because the server fetches a user-supplied URL, requests are SSRF-hardened:
 * - https only, default port only
 * - every resolved IP is checked at connection time (custom DNS lookup), so private, loopback,
 *   link-local and cloud-metadata addresses are refused even under DNS rebinding
 * - redirects are followed manually (max 3) and each hop is re-validated
 * - 5 s timeout, 1 MB response cap, HTML content only
 */
import dns from 'node:dns';
import https from 'node:https';
import net from 'node:net';
import zlib from 'node:zlib';

import { HttpError } from './http.js';

const TIMEOUT_MS = 5000;
const MAX_BYTES = 1024 * 1024;
const MAX_REDIRECTS = 3;
const MAX_URL_LENGTH = 2048;
const MAX_TITLE_LENGTH = 120;

const previewFailed = () =>
  new HttpError(
    422,
    'LINK_PREVIEW_FAILED',
    "Couldn't read that page. You can paste a photo link instead."
  );

const ipv4ToInt = (ip) => ip.split('.').reduce((total, part) => total * 256 + Number(part), 0);

const IPV4_BLOCKED = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 3], // multicast + reserved (224.0.0.0 – 255.255.255.255)
].map(([base, bits]) => ({
  base: ipv4ToInt(base),
  mask: bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0,
}));

/** True for any address a server-side fetch must never reach. */
export const isPrivateAddress = (address) => {
  if (net.isIPv4(address)) {
    const value = ipv4ToInt(address);
    return IPV4_BLOCKED.some(({ base, mask }) => (value & mask) >>> 0 === (base & mask) >>> 0);
  }
  if (net.isIPv6(address)) {
    const lower = address.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return (
      lower === '::' ||
      lower === '::1' ||
      /^f[cd]/.test(lower) || // fc00::/7 unique local
      /^fe[89ab]/.test(lower) || // fe80::/10 link-local
      /^ff/.test(lower) // multicast
    );
  }
  return true;
};

const safeLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);
    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
      return callback(new Error('Blocked address'));
    }
    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
};

const assertFetchableUrl = (url) => {
  if (
    url.protocol !== 'https:' ||
    (url.port && url.port !== '443') ||
    url.username ||
    url.password
  ) {
    throw previewFailed();
  }
  // IP literals skip DNS lookup, so check them directly.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isPrivateAddress(host)) throw previewFailed();
};

const decodeBody = (response) => {
  const encoding = (response.headers['content-encoding'] ?? '').toLowerCase();
  if (encoding === 'gzip') return response.pipe(zlib.createGunzip());
  if (encoding === 'deflate') return response.pipe(zlib.createInflate());
  if (encoding === 'br') return response.pipe(zlib.createBrotliDecompress());
  return response;
};

const requestOnce = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        lookup: safeLookup,
        timeout: TIMEOUT_MS,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BabyRegistryLinkPreview/1.0)',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      },
      (response) => {
        const { statusCode, headers } = response;

        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          response.resume();
          resolve({ redirect: new URL(headers.location, url) });
          return;
        }
        if (
          statusCode !== 200 ||
          !/text\/html|application\/xhtml/i.test(headers['content-type'] ?? '')
        ) {
          response.resume();
          reject(previewFailed());
          return;
        }

        const chunks = [];
        let size = 0;
        const body = decodeBody(response);
        body.on('data', (chunk) => {
          size += chunk.length;
          chunks.push(chunk);
          // Metadata lives in <head>; stop once we have enough rather than failing.
          if (size >= MAX_BYTES) {
            request.destroy();
            resolve({ html: Buffer.concat(chunks).toString('utf8') });
          }
        });
        body.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8') }));
        body.on('error', () => reject(previewFailed()));
      }
    );
    request.on('timeout', () => request.destroy(new Error('Timed out')));
    request.on('error', () => reject(previewFailed()));
  });

const fetchHtml = async (startUrl) => {
  let url = new URL(startUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    assertFetchableUrl(url);
    const result = await requestOnce(url);
    if (result.html !== undefined) return { html: result.html, finalUrl: url };
    url = result.redirect;
  }
  throw previewFailed();
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decodeEntities = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const point =
        code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });

const parseAttributes = (tag) => {
  const attributes = {};
  for (const [, name, , doubleQuoted, singleQuoted, bare] of tag.matchAll(
    /([a-zA-Z_:.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  )) {
    attributes[name.toLowerCase()] = decodeEntities(doubleQuoted ?? singleQuoted ?? bare ?? '');
  }
  return attributes;
};

const IMAGE_META_KEYS = [
  'og:image:secure_url',
  'og:image',
  'og:image:url',
  'twitter:image',
  'twitter:image:src',
];
const TITLE_META_KEYS = ['og:title', 'twitter:title'];

const findJsonLdProductImage = (html) => {
  for (const [, json] of html.matchAll(
    /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      const queue = [JSON.parse(json)];
      while (queue.length > 0) {
        const node = queue.shift();
        if (Array.isArray(node)) {
          queue.push(...node);
        } else if (node && typeof node === 'object') {
          const types = [].concat(node['@type'] ?? []);
          if (types.includes('Product') && node.image) {
            const image = [].concat(node.image)[0];
            return typeof image === 'string' ? image : (image?.url ?? null);
          }
          if (node['@graph']) queue.push(node['@graph']);
        }
      }
    } catch {
      // Malformed JSON-LD is common; ignore it.
    }
  }
  return null;
};

/** Turns a candidate image reference into an absolute https URL, or null. */
const toHttpsUrl = (value, baseUrl) => {
  if (!value) return null;
  try {
    const url = new URL(value.trim(), baseUrl);
    if (url.protocol === 'http:') url.protocol = 'https:';
    if (url.protocol !== 'https:') return null;
    const text = url.toString();
    return text.length <= MAX_URL_LENGTH ? text : null;
  } catch {
    return null;
  }
};

/** Pure extraction step, exported for tests. */
export const extractPreview = (html, pageUrl) => {
  const head = html.slice(0, MAX_BYTES);
  const meta = {};
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(tag);
    const key = (attributes.property ?? attributes.name ?? '').toLowerCase();
    if (key && attributes.content && meta[key] === undefined) meta[key] = attributes.content;
  }

  let imageCandidate = IMAGE_META_KEYS.map((key) => meta[key]).find(Boolean);
  if (!imageCandidate) imageCandidate = findJsonLdProductImage(head);
  if (!imageCandidate) {
    const linkTag = head.match(/<link\b[^>]*rel\s*=\s*["']image_src["'][^>]*>/i);
    if (linkTag) imageCandidate = parseAttributes(linkTag[0]).href;
  }

  let title = TITLE_META_KEYS.map((key) => meta[key]).find(Boolean);
  if (!title) {
    const titleTag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    title = titleTag ? decodeEntities(titleTag[1]) : null;
  }
  title = title?.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE_LENGTH) || null;

  return { imageUrl: toHttpsUrl(imageCandidate, pageUrl), title };
};

export const getLinkPreview = async (url) => {
  const { html, finalUrl } = await fetchHtml(url);
  return extractPreview(html, finalUrl);
};
