import { ReactNode } from 'react';

interface SolutionSectionProps {
  title: string;
  isOptimal?: boolean;
  children: ReactNode;
}

export function SolutionSection({ title, isOptimal = false, children }: SolutionSectionProps) {
  return (
    <div className="my-8 p-6 bg-neutral-900/40 border border-neutral-700 rounded-xl">
      <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center gap-2">
        {title}
        {isOptimal && (
          <span className="text-sm font-normal text-emerald-400 ml-2">⭐ Optimal</span>
        )}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
