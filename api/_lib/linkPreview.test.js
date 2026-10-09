import { describe, expect, it } from 'vitest';

import { extractPreview, getLinkPreview, isPrivateAddress } from './linkPreview.js';

const PAGE = new URL('https://shop.example.com/products/pram');

describe('extractPreview', () => {
  it('reads og:image and og:title in any attribute order, decoding entities', () => {
    const html = `<html><head>
      <meta content="https://cdn.example.com/pram.jpg?w=800&amp;h=800" property="og:image">
      <meta property='og:title' content='Travel System &amp; Car Seat'>
      <title>Ignored</title></head></html>`;
    expect(extractPreview(html, PAGE)).toEqual({
      imageUrl: 'https://cdn.example.com/pram.jpg?w=800&h=800',
      title: 'Travel System & Car Seat',
    });
  });

  it('prefers og:image:secure_url and upgrades http images to https', () => {
    const html = `<meta property="og:image" content="http://cdn.example.com/a.jpg">
      <meta property="og:image:secure_url" content="https://cdn.example.com/b.jpg">`;
    expect(extractPreview(html, PAGE).imageUrl).toBe('https://cdn.example.com/b.jpg');
    expect(
      extractPreview('<meta property="og:image" content="http://cdn.example.com/a.jpg">', PAGE)
        .imageUrl
    ).toBe('https://cdn.example.com/a.jpg');
  });

  it('resolves relative and protocol-relative images against the page', () => {
    expect(
      extractPreview('<meta name="twitter:image" content="/img/pram.png">', PAGE).imageUrl
    ).toBe('https://shop.example.com/img/pram.png');
    expect(
      extractPreview('<meta property="og:image" content="//cdn.example.com/p.png">', PAGE).imageUrl
    ).toBe('https://cdn.example.com/p.png');
  });

  it('falls back to a JSON-LD Product image, then link rel=image_src', () => {
    const jsonLd = `<script type="application/ld+json">
      {"@context":"https://schema.org","@graph":[{"@type":"Product","name":"Cot","image":["https://cdn.example.com/cot.jpg"]}]}
    </script>`;
    expect(extractPreview(jsonLd, PAGE).imageUrl).toBe('https://cdn.example.com/cot.jpg');
    expect(
      extractPreview('<link rel="image_src" href="https://cdn.example.com/x.jpg">', PAGE).imageUrl
    ).toBe('https://cdn.example.com/x.jpg');
  });

  it('uses <title> when there is no og:title, and rejects non-web image schemes', () => {
    const html =
      '<title>  Baby   Monitor | Shop </title><meta property="og:image" content="javascript:alert(1)">';
    expect(extractPreview(html, PAGE)).toEqual({ imageUrl: null, title: 'Baby Monitor | Shop' });
  });

  it('returns nulls when nothing is found', () => {
    expect(extractPreview('<html><body>hi</body></html>', PAGE)).toEqual({
      imageUrl: null,
      title: null,
    });
  });
});

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    'not-an-ip',
  ])('blocks %s', (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(['8.8.8.8', '172.32.0.1', '196.25.1.1', '2606:4700::1111'])('allows %s', (address) => {
    expect(isPrivateAddress(address)).toBe(false);
  });
});

describe('getLinkPreview guards', () => {
  it.each([
    'https://127.0.0.1/',
    'https://[::1]/',
    'https://169.254.169.254/latest/meta-data/',
    'https://localhost/',
    'https://shop.example.com:8443/',
    'https://user:pass@shop.example.com/',
  ])('refuses %s without leaking details', async (url) => {
    await expect(getLinkPreview(url)).rejects.toMatchObject({
      status: 422,
      code: 'LINK_PREVIEW_FAILED',
    });
  });
});
