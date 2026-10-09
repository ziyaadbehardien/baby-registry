import { describe, expect, it, vi } from 'vitest';

import { HttpError, pathId, withErrors } from './http.js';

const request = (path) => new Request(`https://registry.example.com${path}`);

describe('pathId', () => {
  it('reads the ID after the given segment', () => {
    expect(pathId(request('/api/v1/items/42/purchases'), 'items')).toBe('42');
    expect(pathId(request('/api/v1/purchases/7'), 'purchases')).toBe('7');
  });

  it('rejects non-numeric IDs with 404', () => {
    expect(() => pathId(request('/api/v1/items/abc'), 'items')).toThrow(HttpError);
    expect(() => pathId(request('/api/v1/items/0'), 'items')).toThrow(HttpError);
    expect(() => pathId(request('/api/v1/items/1;DROP'), 'items')).toThrow(HttpError);
  });
});

describe('withErrors', () => {
  it('maps HttpError to a { code, message } body', async () => {
    const handler = withErrors(async () => {
      throw new HttpError(403, 'FORBIDDEN', 'Nope.');
    });
    const response = await handler(request('/api/v1/items'));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ code: 'FORBIDDEN', message: 'Nope.' });
  });

  it('hides unexpected error details and logs only the error name', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = withErrors(async () => {
      throw new TypeError('value "Test Guest" violates constraint');
    });

    const response = await handler(request('/api/v1/items'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('Test Guest');
    expect(consoleError).toHaveBeenCalledWith('Unhandled API error: TypeError');
    consoleError.mockRestore();
  });
});
