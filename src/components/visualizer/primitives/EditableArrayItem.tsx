'use client';

import { motion } from 'motion/react';
import type { ElementState } from '../types';

interface EditableArrayItemProps {
  value: number | string;
  index: number;
  state?: ElementState;
  showIndex?: boolean;
  colors?: Record<ElementState, string>;
  editable?: boolean;
  onValueChange?: (index: number, value: number) => void;
}

const defaultColors: Record<ElementState, string> = {
  default: "bg-neutral-800 border-neutral-600",
  active: "bg-blue-500/20 border-blue-400",
  comparing: "bg-amber-500/20 border-amber-400",
  swapping: "bg-purple-500/20 border-purple-400",
  sorted: "bg-emerald-500/20 border-emerald-400",
  target: "bg-rose-500/20 border-rose-400",
  found: "bg-green-500/20 border-green-400",
};

export function EditableArrayItem({
  value,
  index,
  state = 'default',
  showIndex = true,
  colors = defaultColors,
  editable = false,
  onValueChange,
}: EditableArrayItemProps) {
  const colorClass = colors[state] || defaultColors[state];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || newValue === '-') {
      onValueChange?.(index, 0);
      return;
    }
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && onValueChange) {
      onValueChange(index, numValue);
    }
  };

  return (
    <div className='flex flex-col items-center gap-2'>
      {showIndex && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-xs text-neutral-400 font-mono'
        >
          {index}
        </motion.div>
      )}
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className={`
          w-16 h-16
          rounded-lg
          border-2
          flex items-center justify-center
          transition-colors duration-300
          ${colorClass}
        `}
      >
        {editable ? (
          <input
            type="number"
            value={value}
            onChange={handleChange}
            className="w-full h-full bg-transparent text-center outline-none text-neutral-100 font-mono text-base font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <span className="font-mono text-base font-semibold text-neutral-100">{value}</span>
        )}
      </motion.div>
    </div>
  );
}
