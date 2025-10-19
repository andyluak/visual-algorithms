interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-600"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
