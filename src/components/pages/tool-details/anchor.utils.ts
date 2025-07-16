import type { Locale } from '@/utils/i18n';
import { getEntry } from 'astro:content';
import { defaultLocale, localizedPath, omitLocale } from '@/utils/i18n';
import { isPublished } from '@/utils/tools';

export async function getHrefForMdxTool(href: string, locale: Locale) {
  const toolName = href.split('/').pop()?.replace('.mdx', '');

  if (!toolName) {
    throw new Error(`Cannot get tool name from href: ${href}`);
  }

  let tool = await getEntry('tools', `${locale}/${toolName}`);

  if (tool && isPublished(tool)) {
    return localizedPath(`/${omitLocale(tool.data.path ?? tool.id)}`, locale);
  }

  tool = await getEntry('tools', `${defaultLocale}/${toolName}`);

  if (!tool || !isPublished(tool)) {
    throw new Error(`Tool ${toolName} not found`);
  }

  return localizedPath(`/${omitLocale(tool.data.path ?? tool.id)}`, defaultLocale);
}
