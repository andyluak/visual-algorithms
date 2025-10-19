"use client";

import { useAlgorithmState } from "../hooks/useAlgorithmState";
import { ArrayItem } from "../primitives/ArrayItem";
import { EditableArrayItem } from "../primitives/EditableArrayItem";
import { Pointer } from "../primitives/Pointer";
import type { VisualizerConfig, ElementState } from "../types";
import { Plus, X } from "lucide-react";

interface ArrayVisualizerProps {
  config?: VisualizerConfig;
  editable?: boolean;
  onDataChange?: (newData: (number | string)[]) => void;
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
}

export function ArrayVisualizer({
  config,
  editable = false,
  onDataChange,
  onAddItem,
  onRemoveItem,
}: ArrayVisualizerProps) {
  const {
    data,
    activeIndices,
    comparingIndices,
    swappingIndices,
    sortedIndices,
    targetIndices,
    foundIndices,
    pointers,
    variables,
    steps,
    currentStep,
  } = useAlgorithmState();

  const handleValueChange = (index: number, value: number) => {
    if (!onDataChange) return;
    const newData = [...data];
    newData[index] = value;
    onDataChange(newData);
  };

  const getElementState = (index: number): ElementState => {
    if (foundIndices.has(index)) return "found";
    if (targetIndices.has(index)) return "target";
    if (sortedIndices.has(index)) return "sorted";
    if (swappingIndices.has(index)) return "swapping";
    if (comparingIndices.has(index)) return "comparing";
    if (activeIndices.has(index)) return "active";
    return "default";
  };

  const currentStepData = steps[currentStep];

  return (
    <div className='space-y-8'>
      {/* Array Visualization */}
      <div className='flex flex-col items-center'>
        {/* Pointers */}
        {pointers.length > 0 && (
          <div className='h-14 mb-2 flex gap-2'>
            {data.map((_, index) => (
              <div key={index} className='w-16 flex justify-center items-end'>
                {pointers.find((p) => p.index === index) && (
                  <div className='flex flex-col items-center gap-1'>
                    <span
                      className={`text-xs font-mono font-medium ${
                        pointers.find((p) => p.index === index)?.color ||
                        "text-blue-400"
                      }`}
                    >
                      {pointers.find((p) => p.index === index)?.name}
                    </span>
                    <svg
                      className={`w-4 h-4 ${
                        pointers.find((p) => p.index === index)?.color ||
                        "text-blue-400"
                      }`}
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Array Items */}
        <div className='flex gap-2 items-end'>
          {data.map((value, index) => (
            <div key={index} className='relative group'>
              {editable && currentStep === 0 ? (
                <EditableArrayItem
                  value={value}
                  index={index}
                  state={getElementState(index)}
                  showIndex={config?.showIndices ?? true}
                  showValue={config?.showValues ?? true}
                  colors={config?.colors}
                  editable={true}
                  onValueChange={handleValueChange}
                />
              ) : (
                <ArrayItem
                  value={value}
                  index={index}
                  state={getElementState(index)}
                  showIndex={config?.showIndices ?? true}
                  showValue={config?.showValues ?? true}
                  colors={config?.colors}
                />
              )}
              {editable &&
                currentStep === 0 &&
                data.length > 1 &&
                onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(index)}
                    className='absolute -top-1 -right-1 w-5 h-5 bg-neutral-700 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10'
                    aria-label='Remove item'
                  >
                    <X className='w-3 h-3 text-neutral-100' />
                  </button>
                )}
            </div>
          ))}
          {editable && currentStep === 0 && onAddItem && (
            <button
              onClick={onAddItem}
              className='w-16 h-16 bg-neutral-800/80 hover:bg-neutral-700 border-2 border-neutral-600 hover:border-blue-500 rounded-lg flex items-center justify-center transition-all'
              aria-label='Add item'
            >
              <Plus className='w-5 h-5 text-neutral-300' />
            </button>
          )}
        </div>
      </div>

      {/* Step Description */}
      {currentStepData?.description && (
        <div className='p-4 border border-neutral-700 rounded-lg'>
          <p className='text-sm text-neutral-900 leading-relaxed'>
            {currentStepData.description}
          </p>
        </div>
      )}

      {/* Variables */}
      {Object.keys(variables).length > 0 && (
        <div className='flex flex-wrap gap-3'>
          {Object.entries(variables).map(([key, value]) => (
            <div
              key={key}
              className='px-3 py-2 border border-neutral-700 rounded-md'
            >
              <span className='text-xs text-neutral-400 font-medium'>
                {key}:
              </span>
              <span className='ml-2 text-sm font-mono text-neutral-900 font-semibold'>
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Code Highlight (if provided) */}
      {currentStepData?.code && (
        <div className='p-4 bg-neutral-950/50 border border-neutral-700 rounded-lg'>
          <pre className='text-xs font-mono text-neutral-300'>
            <code>{currentStepData.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
