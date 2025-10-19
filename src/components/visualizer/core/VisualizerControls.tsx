"use client";

import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { useAlgorithmState } from "../hooks/useAlgorithmState";
import { useEffect, useRef } from "react";
import type { ParamConfig } from "../types";

interface VisualizerControlsProps {
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  params?: Record<string, unknown>;
  paramConfig?: ParamConfig[];
  onParamChange?: (name: string, value: unknown) => void;
  onRunAlgorithm?: () => void;
}

const speedOptions = [
  { label: "0.5×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "4×", value: 4 },
];

export function VisualizerControls({
  speed: controlledSpeed,
  onSpeedChange,
  params = {},
  paramConfig = [],
  onParamChange,
  onRunAlgorithm,
}: VisualizerControlsProps) {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    speed: storeSpeed,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    setSpeed,
  } = useAlgorithmState();

  const isAtEnd = currentStep >= totalSteps - 1;

  // Auto-play when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      nextStep();
    }, 1000 / storeSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, storeSpeed, nextStep]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
  };

  const handlePlayPause = () => {
    if (isAtEnd) {
      // If at the end, restart and play
      reset();
      setTimeout(() => play(), 50); // Small delay to allow reset to complete
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Track initial mount to avoid running on first render
  const isInitialMount = useRef(true);
  const paramsRef = useRef(params);

  const handleParamUpdate = (name: string, value: string) => {
    const config = paramConfig.find((p) => p.name === name);
    if (!config) return;

    const parsedValue = config.type === "number" ? parseInt(value, 10) : value;
    if (config.type === "number" && isNaN(parsedValue as number)) return;

    onParamChange?.(name, parsedValue);
  };

  // Auto-update visualization when params change (only at step 0)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      paramsRef.current = params;
      return;
    }

    // Only auto-run if we're at step 0 and params actually changed
    if (currentStep === 0 && JSON.stringify(params) !== JSON.stringify(paramsRef.current)) {
      paramsRef.current = params;
      onRunAlgorithm?.();
    }
  }, [params, currentStep, onRunAlgorithm]);

  return (
    <div className='flex flex-col gap-4 p-4 bg-neutral-900/80 border border-neutral-700 rounded-lg'>
      {/* Parameters (if any) */}
      {paramConfig.length > 0 && (
        <div className='flex items-center gap-4 pb-3 border-b border-neutral-700'>
          {paramConfig.map((config) => (
            <div key={config.name} className='flex items-center gap-2'>
              <label className='text-sm text-neutral-300 font-medium'>
                {config.label}:
              </label>
              <input
                type={config.type}
                value={params[config.name] ?? config.defaultValue}
                onChange={(e) => handleParamUpdate(config.name, e.target.value)}
                disabled={currentStep !== 0}
                className='w-24 h-9 px-3 bg-neutral-800 border-2 border-neutral-600 rounded-md font-mono text-sm font-semibold text-neutral-100 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              />
            </div>
          ))}
        </div>
      )}

      {/* Playback Controls */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className='p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            aria-label='Previous step'
          >
            <SkipBack className='w-4 h-4 text-neutral-200' />
          </button>

          <button
            onClick={handlePlayPause}
            className='p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors'
            aria-label={isAtEnd ? "Restart" : isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className='w-4 h-4 text-neutral-200' />
            ) : isAtEnd ? (
              <RotateCcw className='w-4 h-4 text-neutral-200' />
            ) : (
              <Play className='w-4 h-4 text-neutral-200' />
            )}
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep >= totalSteps - 1}
            className='p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            aria-label='Next step'
          >
            <SkipForward className='w-4 h-4 text-neutral-200' />
          </button>

          <button
            onClick={reset}
            className='p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors ml-2'
            aria-label='Reset'
          >
            <RotateCcw className='w-4 h-4 text-neutral-200' />
          </button>
        </div>

        {/* Progress */}
        <div className='flex-1 flex items-center gap-3'>
          <div className='flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-blue-500 transition-all duration-300 rounded-full'
              style={{
                width: `${
                  totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0
                }%`,
              }}
            />
          </div>
          <span className='text-xs font-mono text-neutral-300 min-w-[60px]'>
            {currentStep} / {totalSteps - 1}
          </span>
        </div>

        {/* Speed Control */}
        <div className='flex items-center gap-2 border-l border-neutral-700 pl-4'>
          <span className='text-xs text-neutral-400 font-medium'>Speed:</span>
          <div className='flex gap-1'>
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                className={`
                px-2.5 py-1 rounded-md text-xs font-mono transition-colors border
                ${
                  storeSpeed === option.value
                    ? "bg-blue-500/20 text-blue-400 border-blue-500"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-neutral-600"
                }
              `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
