import { cn } from '@/utils/styles';

export interface ToolsGridItemProps {
  className?: string;
  tool: {
    id: string;
    name: string;
    summary: string;
    synonyms: string[];
    url: string;
    tags: {
      id: string;
      name: string;
    }[];
  };
}

export function ToolsGridItemPreact({ tool, className }: ToolsGridItemProps) {
  return (
    <li className={cn('group flex content-auto', className)}>
      <a href={tool.url} className="flex w-full flex-col border px-4 py-3">
        <h3 className="font-heading text-xl font-black group-hover:underline">{tool.name}</h3>
        <p className="text-pretty">{tool.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {tool.tags.map((tag) => (
            <li key={tag.id} className="w-fit bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-700">
              {tag.name}
            </li>
          ))}
        </ul>
      </a>
    </li>
  );
}
