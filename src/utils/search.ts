interface SearchableTool {
  id: string;
  name: string;
  tags: string[];
}

export function searchTools(tools: SearchableTool[], search?: string | null, tag?: string | null) {
  const parsedSearch = search?.trim().toLowerCase();

  return new Set(
    tools
      .filter((tool) => {
        const nameMatch = parsedSearch ? tool.name.toLowerCase().includes(parsedSearch) : true;
        const tagsMatch = tag ? tool.tags.some((t) => t === tag) : true;
        return nameMatch && tagsMatch;
      })
      .map((tool) => tool.id),
  );
}
