"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { create } from "zustand";

interface PermutationState {
  currentPermutation: number[];
  allPermutations: number[][];
  recursionStack: Array<{
    depth: number;
    current: number[];
    remaining: number[];
    action: string;
  }>;
  isGenerating: boolean;
  currentStep: number;
  startGeneration: (nums: number[]) => void;
  reset: () => void;
}

const usePermutationStore = create<PermutationState>((set) => ({
  currentPermutation: [],
  allPermutations: [],
  recursionStack: [],
  isGenerating: false,
  currentStep: 0,

  startGeneration: (nums: number[]) => {
    const steps: Array<{
      depth: number;
      current: number[];
      remaining: number[];
      action: string;
    }> = [];
    const result: number[][] = [];

    function backtrack(current: number[], remaining: number[], depth: number) {
      steps.push({
        depth,
        current: [...current],
        remaining: [...remaining],
        action: remaining.length === 0 ? "Add permutation" : `Explore depth ${depth}`,
      });

      if (remaining.length === 0) {
        result.push([...current]);
        return;
      }

      for (let i = 0; i < remaining.length; i++) {
        const num = remaining[i];
        const newCurrent = [...current, num];
        const newRemaining = remaining.filter((_, idx) => idx !== i);

        steps.push({
          depth: depth + 1,
          current: newCurrent,
          remaining: newRemaining,
          action: `Choose ${num}`,
        });

        backtrack(newCurrent, newRemaining, depth + 1);

        steps.push({
          depth,
          current: [...current],
          remaining: [...remaining],
          action: `Backtrack from ${num}`,
        });
      }
    }

    backtrack([], nums, 0);

    set({
      recursionStack: steps,
      allPermutations: result,
      currentStep: 0,
      isGenerating: true,
    });
  },

  reset: () => {
    set({
      currentPermutation: [],
      allPermutations: [],
      recursionStack: [],
      isGenerating: false,
      currentStep: 0,
    });
  },
}));

interface PermutationsVisualizerProps {
  defaultNums?: number[];
}

export function PermutationsVisualizer({
  defaultNums = [1, 2, 3],
}: PermutationsVisualizerProps) {
  const { recursionStack, allPermutations, currentStep, startGeneration, reset } =
    usePermutationStore();
  const [nums, setNums] = useState(defaultNums.join(","));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const handleGenerate = useCallback(() => {
    const parsedNums = nums
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));

    if (parsedNums.length === 0) return;
    reset();
    startGeneration(parsedNums);
  }, [nums, startGeneration, reset]);

  const handleReset = useCallback(() => {
    reset();
    setIsPlaying(false);
  }, [reset]);

  useEffect(() => {
    if (!isPlaying || currentStep >= recursionStack.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      usePermutationStore.setState({ currentStep: currentStep + 1 });
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, recursionStack.length, speed]);

  const currentState = recursionStack[currentStep];
  const completedPerms = allPermutations.slice(
    0,
    recursionStack.slice(0, currentStep + 1).filter((s) => s.action === "Add permutation")
      .length
  );

  return (
    <div className='w-full space-y-6 my-8 p-6 border border-fd-border rounded-xl bg-fd-card'>
      {/* Controls */}
      <div className='space-y-4'>
        <div className='flex gap-3 items-center flex-wrap'>
          <div className='flex items-center gap-2'>
            <label className='text-sm text-fd-muted-foreground'>Input Array:</label>
            <input
              type='text'
              value={nums}
              onChange={(e) => setNums(e.target.value)}
              placeholder='1,2,3'
              className='w-32 px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm font-mono'
            />
          </div>

          <button
            onClick={handleGenerate}
            className='px-4 py-2 bg-fd-primary hover:bg-fd-primary/90 text-fd-primary-foreground text-sm font-medium rounded transition-colors'
          >
            Generate
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={recursionStack.length === 0}
            className='px-4 py-2 bg-fd-primary hover:bg-fd-primary/90 disabled:bg-fd-muted disabled:opacity-50 text-fd-primary-foreground text-sm font-medium rounded transition-colors'
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleReset}
            className='px-4 py-2 bg-fd-secondary hover:bg-fd-accent text-fd-secondary-foreground text-sm font-medium rounded transition-colors'
          >
            Reset
          </button>

          <div className='flex items-center gap-2'>
            <label className='text-sm text-fd-muted-foreground'>Speed:</label>
            <input
              type='range'
              min='100'
              max='1000'
              step='100'
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className='w-24'
            />
            <span className='text-xs text-fd-muted-foreground'>{speed}ms</span>
          </div>
        </div>

        {recursionStack.length > 0 && (
          <div className='flex items-center gap-3'>
            <input
              type='range'
              min='0'
              max={recursionStack.length - 1}
              value={currentStep}
              onChange={(e) => {
                usePermutationStore.setState({ currentStep: Number(e.target.value) });
                setIsPlaying(false);
              }}
              className='flex-1'
            />
            <span className='text-sm text-fd-muted-foreground'>
              Step: {currentStep + 1} / {recursionStack.length}
            </span>
          </div>
        )}
      </div>

      {/* Current State Visualization */}
      {currentState && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-fd-foreground'>
            Current State - {currentState.action}
          </h3>

          <div className='p-4 bg-fd-muted rounded-lg border border-fd-border space-y-3'>
            {/* Current Permutation */}
            <div className='space-y-2'>
              <div className='text-xs text-fd-muted-foreground font-medium'>
                Current Path (Depth {currentState.depth}):
              </div>
              <div className='flex gap-2 items-center'>
                {currentState.current.length === 0 ? (
                  <div className='text-sm text-fd-muted-foreground italic'>Empty</div>
                ) : (
                  currentState.current.map((num, idx) => (
                    <motion.div
                      key={`${idx}-${num}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='w-12 h-12 rounded-lg border-2 border-fd-primary bg-fd-accent flex items-center justify-center text-lg font-bold text-fd-foreground'
                    >
                      {num}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Remaining Numbers */}
            <div className='space-y-2'>
              <div className='text-xs text-fd-muted-foreground font-medium'>
                Remaining Choices:
              </div>
              <div className='flex gap-2 items-center'>
                {currentState.remaining.length === 0 ? (
                  <div className='text-sm text-fd-muted-foreground italic'>
                    None (Complete permutation!)
                  </div>
                ) : (
                  currentState.remaining.map((num, idx) => (
                    <div
                      key={`${idx}-${num}`}
                      className='w-12 h-12 rounded-lg border-2 border-fd-border bg-fd-background flex items-center justify-center text-lg font-bold text-fd-foreground'
                    >
                      {num}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recursion Depth Indicator */}
            <div className='flex items-center gap-2'>
              <div className='text-xs text-fd-muted-foreground font-medium'>
                Recursion Depth:
              </div>
              <div className='flex gap-1'>
                {Array.from({ length: currentState.depth + 1 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='w-3 h-8 bg-fd-primary rounded'
                    style={{ opacity: 1 - idx * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Permutations */}
      <div className='space-y-3'>
        <h3 className='text-sm font-medium text-fd-foreground'>
          Generated Permutations ({completedPerms.length} of {allPermutations.length})
        </h3>
        <div className='max-h-64 overflow-y-auto p-3 bg-fd-muted rounded border border-fd-border'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
            <AnimatePresence>
              {completedPerms.map((perm, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='p-2 bg-fd-accent border border-fd-border rounded flex items-center justify-center gap-1'
                >
                  {perm.map((num, i) => (
                    <span key={i} className='text-fd-foreground font-mono font-semibold'>
                      {num}
                      {i < perm.length - 1 && ","}
                    </span>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {completedPerms.length === 0 && (
            <div className='text-center text-fd-muted-foreground text-sm py-4'>
              No permutations generated yet. Click Generate and Play.
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className='p-4 bg-fd-accent border border-fd-border rounded'>
        <p className='text-sm text-fd-muted-foreground'>
          <strong className='text-fd-foreground'>How it works:</strong> Backtracking
          explores all possible permutations by choosing one number at a time, recursing
          with the remaining numbers, then backtracking to try other choices. Each
          complete path from root to leaf represents one permutation.
        </p>
      </div>
    </div>
  );
}
