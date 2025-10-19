interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const difficultyStyles = {
  Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500',
  Hard: 'bg-rose-500/20 text-rose-400 border-rose-500',
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold border ${difficultyStyles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
