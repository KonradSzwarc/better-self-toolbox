import Fuse from 'fuse.js';

interface SearchableTool {
  id: string;
  name: string;
  synonyms: string[];
  tags: string[];
}

export function createSearch(tools: SearchableTool[]) {
  const fuse = new Fuse(tools, {
    keys: ['name', 'synonyms', 'tags'],
    threshold: 0.3,
    minMatchCharLength: 1,
  });

  return (search?: string | null, tag?: string | null) => {
    let results = search ? fuse.search(search).map((result) => result.item) : tools;

    if (tag) {
      results = results.filter((result) => result.tags.includes(tag));
    }

    return new Set(results.map((result) => result.id));
  };
}
