"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BinarySearchVisualizerProps {
  data?: number[];
  target?: number;
}

interface ElementState {
  value: number;
  index: number;
  state: "default" | "searching" | "found" | "eliminated" | "mid";
  isLeft?: boolean;
  isRight?: boolean;
  isMid?: boolean;
}

export function BinarySearchVisualizer({
  data = [-1, 0, 3, 5, 9, 12],
  target = 9,
}: BinarySearchVisualizerProps) {
  const [array, setArray] = useState<number[]>(data);
  const [targetValue, setTargetValue] = useState(target);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elementStates, setElementStates] = useState<ElementState[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [leftPointer, setLeftPointer] = useState<number | null>(null);
  const [rightPointer, setRightPointer] = useState<number | null>(null);
  const [midPointer, setMidPointer] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1000);
  const [comparison, setComparison] = useState<string>("");
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const initializeVisualization = useCallback(() => {
    const elements: ElementState[] = array.map((value, index) => ({
      value,
      index,
      state: "default",
    }));

    setElementStates(elements);
    setCurrentStep(0);
    setResult(null);
    setLeftPointer(null);
    setRightPointer(null);
    setMidPointer(null);
    setComparison("");
    setIsPlaying(false);

    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, [array]);

  useEffect(() => {
    initializeVisualization();
  }, [initializeVisualization]);

  const executeStep = useCallback(() => {
    if (currentStep === 0) {
      // Initialize search
      const left = 0;
      const right = array.length - 1;
      setLeftPointer(left);
      setRightPointer(right);

      setElementStates((prev) =>
        prev.map((el, idx) => ({
          ...el,
          state: idx >= left && idx <= right ? "searching" : "eliminated",
        }))
      );

      setComparison("Starting binary search...");

      animationRef.current = setTimeout(() => {
        setCurrentStep(1);
      }, speed);
      return;
    }

    // Calculate current pointers
    const stepData = getCurrentStepData();
    if (!stepData) return;

    const { left, right } = stepData;

    if (left > right) {
      // Not found
      setResult(-1);
      setIsPlaying(false);
      setComparison(`Target ${targetValue} not found in array`);
      return;
    }

    const mid = Math.floor((left + right) / 2);
    setMidPointer(mid);

    setElementStates((prev) =>
      prev.map((el, idx) => {
        if (idx === mid) return { ...el, state: "mid" };
        if (idx >= left && idx <= right) return { ...el, state: "searching" };
        return { ...el, state: "eliminated" };
      })
    );

    setComparison(`Mid = ${mid}, array[${mid}] = ${array[mid]}, comparing with target ${targetValue}`);

    animationRef.current = setTimeout(() => {
      if (array[mid] === targetValue) {
        // Found
        setElementStates((prev) =>
          prev.map((el, idx) => (idx === mid ? { ...el, state: "found" } : el))
        );
        setResult(mid);
        setIsPlaying(false);
        setComparison(`Found target ${targetValue} at index ${mid}!`);
      } else if (array[mid] < targetValue) {
        // Search right half
        setComparison(`${array[mid]} < ${targetValue}, search right half`);
        setLeftPointer(mid + 1);
        setCurrentStep((prev) => prev + 1);
      } else {
        // Search left half
        setComparison(`${array[mid]} > ${targetValue}, search left half`);
        setRightPointer(mid - 1);
        setCurrentStep((prev) => prev + 1);
      }
    }, speed);
  }, [array, targetValue, currentStep, speed]);

  const getCurrentStepData = () => {
    if (leftPointer === null || rightPointer === null) return null;
    return { left: leftPointer, right: rightPointer };
  };

  useEffect(() => {
    if (isPlaying) {
      executeStep();
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, executeStep]);

  const handlePlay = () => {
    if (result !== null) {
      initializeVisualization();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleReset = () => {
    initializeVisualization();
  };

  const handleStepForward = () => {
    if (!isPlaying) {
      executeStep();
    }
  };

  const handleArrayChange = (value: string) => {
    const newArray = value
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
    setArray(newArray);
  };

  const getElementColor = (state: ElementState["state"]) => {
    switch (state) {
      case "found":
        return "bg-emerald-600/90 border-emerald-400 text-white scale-110";
      case "mid":
        return "bg-yellow-600/90 border-yellow-400 text-white";
      case "searching":
        return "bg-blue-600/70 border-blue-400 text-white";
      case "eliminated":
        return "bg-neutral-800/40 border-neutral-700/40 text-neutral-600";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-300";
    }
  };

  return (
    <div className="w-full space-y-6 my-8 p-6 border border-neutral-700 rounded-xl">
      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Sorted Array (comma-separated):</label>
          <input
            type="text"
            value={array.join(", ")}
            onChange={(e) => handleArrayChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm font-mono"
            placeholder="e.g., -1, 0, 3, 5, 9, 12"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Target Value:</label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm"
          />
        </div>
      </div>

      {/* Array Visualization */}
      <div className="min-h-40 flex flex-col items-center justify-center">
        {elementStates.length === 0 ? (
          <div className="text-neutral-500 text-sm">Enter an array to visualize</div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap justify-center mb-12">
              <AnimatePresence>
                {elementStates.map((element) => (
                  <motion.div
                    key={element.index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{
                        scale: element.state === "found" ? 1.1 : 1,
                      }}
                      className={`
                        w-14 h-14 flex items-center justify-center
                        border-2 rounded-lg font-mono text-base font-semibold
                        transition-all duration-300
                        ${getElementColor(element.state)}
                      `}
                    >
                      {element.value}
                    </motion.div>

                    {/* Pointer Labels */}
                    {leftPointer === element.index && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-blue-400 font-semibold whitespace-nowrap">
                        L
                      </div>
                    )}
                    {midPointer === element.index && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-yellow-400 font-semibold whitespace-nowrap">
                        M
                      </div>
                    )}
                    {rightPointer === element.index && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-purple-400 font-semibold whitespace-nowrap">
                        R
                      </div>
                    )}

                    {/* Index */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-neutral-600 font-mono">
                      {element.index}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Comparison Text */}
            {comparison && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-neutral-400 text-center font-mono"
              >
                {comparison}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Result Display */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded border text-center font-semibold ${
            result >= 0
              ? "bg-emerald-900/20 border-emerald-700/40 text-emerald-400"
              : "bg-red-900/20 border-red-700/40 text-red-400"
          }`}
        >
          {result >= 0
            ? `✓ Found at index ${result}`
            : `✗ Target ${targetValue} not found`}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 items-center flex-wrap">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-medium rounded transition-colors"
            disabled={elementStates.length === 0}
          >
            {result !== null ? "Restart" : "Play"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-yellow-600/80 hover:bg-yellow-600 text-white text-sm font-medium rounded transition-colors"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleStepForward}
          className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPlaying || result !== null || elementStates.length === 0}
        >
          Step
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm font-medium rounded transition-colors"
        >
          Reset
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <label className="text-sm text-neutral-400">Speed (ms):</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            min="300"
            max="2000"
            step="100"
            className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-800 border border-neutral-700"></div>
          <span className="text-neutral-400">Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600 border border-blue-400"></div>
          <span className="text-neutral-400">Search Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-600 border border-yellow-400"></div>
          <span className="text-neutral-400">Mid Point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-400"></div>
          <span className="text-neutral-400">Found</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-800/40 border border-neutral-700/40"></div>
          <span className="text-neutral-400">Eliminated</span>
        </div>
      </div>

      {/* Pointer Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-semibold">L</span>
          <span className="text-neutral-400">Left Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-semibold">M</span>
          <span className="text-neutral-400">Mid Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-semibold">R</span>
          <span className="text-neutral-400">Right Pointer</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-900/10 border border-blue-700/30 rounded">
        <p className="text-sm text-neutral-400">
          <strong className="text-blue-400">Binary Search:</strong> Efficiently finds a target value
          in a sorted array by repeatedly dividing the search interval in half. Time complexity: O(log n).
        </p>
      </div>
    </div>
  );
}
