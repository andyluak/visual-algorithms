'use client';

import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';

interface PointerProps {
  name: string;
  index: number;
  color?: string;
  offset?: number;
}

export function Pointer({
  name,
  index,
  color = 'text-blue-400',
  offset = 0,
}: PointerProps) {
  // Calculate position: 64px (w-16) + 8px (gap-2) = 72px per item
  // Center within item: 64px / 2 = 32px offset
  // But we need to account for the pointer's own width, so just center using transform
  const leftPosition = index * 72;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className="absolute flex flex-col items-center gap-1 w-16"
      style={{
        left: `${leftPosition}px`,
        top: offset
      }}
    >
      <span className={`text-xs font-mono font-medium ${color}`}>{name}</span>
      <ArrowDown className={`w-4 h-4 ${color}`} />
    </motion.div>
  );
}
