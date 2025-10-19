interface ComplexityTableProps {
  time: string;
  space: string;
}

export function ComplexityTable({ time, space }: ComplexityTableProps) {
  return (
    <div className='inline-flex items-center gap-6 my-4 px-4 py-2.5 border border-neutral-700 rounded-lg'>
      <div className='flex items-center gap-2'>
        <span className='text-xs text-neutral-700 font-medium'>Time:</span>
        <code className='text-sm font-mono font-semibold text-blue-400'>
          {time}
        </code>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-xs text-neutral-700 font-medium'>Space:</span>
        <code className='text-sm font-mono font-semibold text-purple-400'>
          {space}
        </code>
      </div>
    </div>
  );
}
