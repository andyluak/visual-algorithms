"use client";

import { useState } from "react";
import { Plus, X, Play, RotateCcw } from "lucide-react";

interface InteractiveArrayInputProps {
  initialData: (number | string)[];
  initialParams?: Record<string, unknown>;
  onRun: (data: (number | string)[], params: Record<string, unknown>) => void;
  paramConfig?: {
    name: string;
    label: string;
    type: "number" | "string";
    defaultValue: unknown;
  }[];
}

export function InteractiveArrayInput({
  initialData,
  initialParams = {},
  onRun,
  paramConfig = [],
}: InteractiveArrayInputProps) {
  const [arrayData, setArrayData] = useState<(number | string)[]>(initialData);
  const [params, setParams] = useState<Record<string, unknown>>(initialParams);
  const [, setEditingIndex] = useState<number | null>(null);

  const handleAddItem = () => {
    setArrayData([...arrayData, 0]);
    setEditingIndex(arrayData.length);
  };

  const handleRemoveItem = (index: number) => {
    setArrayData(arrayData.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, value: string) => {
    // Allow empty string for editing
    if (value === "") {
      const newData = [...arrayData];
      newData[index] = 0;
      setArrayData(newData);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const newData = [...arrayData];
      newData[index] = numValue;
      setArrayData(newData);
    }
  };

  const handleUpdateParam = (name: string, value: string) => {
    const config = paramConfig.find((p) => p.name === name);
    if (!config) return;

    // Allow empty for editing
    if (value === "") {
      setParams({ ...params, [name]: "" });
      return;
    }

    const parsedValue = config.type === "number" ? parseInt(value, 10) : value;
    if (config.type === "number" && isNaN(parsedValue as number)) return;

    setParams({ ...params, [name]: parsedValue });
  };

  const handleRun = () => {
    onRun(arrayData, params);
  };

  const handleReset = () => {
    setArrayData(initialData);
    setParams(initialParams);
    onRun(initialData, initialParams);
  };

  return (
    <div className='p-6 border border-neutral-700 rounded-xl space-y-5'>
      <div>
        <h3 className='text-base font-semibold text-neutral-200 mb-1'>
          Try Your Own Input
        </h3>
        <p className='text-xs text-neutral-400'>
          Modify the array and parameters to see how the algorithm works
        </p>
      </div>

      {/* Array Input */}
      <div className='space-y-3'>
        <label className='text-sm text-neutral-300 font-medium block'>
          Array
        </label>
        <div className='flex flex-wrap gap-2 items-center'>
          {arrayData.map((value, index) => (
            <div key={index} className='relative group'>
              <input
                type='number'
                value={value}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                onFocus={() => setEditingIndex(index)}
                onBlur={() => setEditingIndex(null)}
                placeholder='0'
                className='w-20 h-12 px-3 bg-neutral-800/80 border-2 border-neutral-600 rounded-lg text-center font-mono text-base font-semibold text-neutral-100 focus:outline-none focus:border-blue-500 focus:bg-neutral-800 hover:border-neutral-500 transition-all'
              />
              {arrayData.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className='absolute -top-2 -right-2 w-6 h-6 bg-neutral-700 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg'
                  aria-label='Remove item'
                >
                  <X className='w-3.5 h-3.5 text-neutral-100' />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddItem}
            className='w-12 h-12 bg-neutral-800/80 hover:bg-neutral-700 border-2 border-neutral-600 hover:border-blue-500 rounded-lg flex items-center justify-center transition-all'
            aria-label='Add item'
          >
            <Plus className='w-5 h-5 text-neutral-300' />
          </button>
        </div>
      </div>

      {/* Parameter Inputs */}
      {paramConfig.map((config) => (
        <div key={config.name} className='space-y-3'>
          <label className='text-sm text-neutral-300 font-medium block'>
            {config.label}
          </label>
          <input
            type={config.type}
            value={
              (params[config.name] as string) ?? (config.defaultValue as string)
            }
            onChange={(e) => handleUpdateParam(config.name, e.target.value)}
            placeholder={String(config.defaultValue)}
            className='w-40 h-12 px-4 bg-neutral-800/80 border-2 border-neutral-600 rounded-lg font-mono text-base font-semibold text-neutral-100 focus:outline-none focus:border-blue-500 focus:bg-neutral-800 hover:border-neutral-500 transition-all'
          />
        </div>
      ))}

      {/* Action Buttons */}
      <div className='flex gap-3 pt-2'>
        <button
          onClick={handleRun}
          className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl'
        >
          <Play className='w-4 h-4' />
          Run Algorithm
        </button>
        <button
          onClick={handleReset}
          className='px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border-2 border-neutral-600 hover:border-neutral-500 text-neutral-200 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all'
        >
          <RotateCcw className='w-4 h-4' />
          Reset
        </button>
      </div>
    </div>
  );
}
