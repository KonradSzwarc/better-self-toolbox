import { brotliCompressSync, gzipSync } from 'node:zlib';
import type { APIContext, MiddlewareNext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { localizedHomepages } from './utils/i18n/constants';

const cache = new Map<string, Buffer<ArrayBufferLike>>();

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  if (localizedHomepages.has(url.pathname) && url.searchParams.size === 0) {
    return noParamsHomepage(url, context, next);
  }

  return next();
});

async function noParamsHomepage(url: URL, context: APIContext, next: MiddlewareNext) {
  const encoding = context.request.headers.get('accept-encoding')?.includes('br') ? 'br' : 'gzip';
  const cacheKey = `${encoding}/${url.pathname}`;

  if (!cache.has(cacheKey)) {
    const page = await next();
    const body = await page.text();

    cache.set(cacheKey, encoding === 'br' ? brotliCompressSync(body) : gzipSync(body));
  }

  const body = cache.get(cacheKey)!;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Content-Encoding': encoding,
      'Content-Length': body.length.toString(),
    },
  });
}
