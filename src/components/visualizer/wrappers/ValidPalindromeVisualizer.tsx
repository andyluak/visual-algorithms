"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ValidPalindromeVisualizerProps {
  data?: string;
}

interface CharState {
  char: string;
  index: number;
  originalIndex: number;
  state: "default" | "active" | "match" | "mismatch" | "complete";
  isLeft?: boolean;
  isRight?: boolean;
}

export function ValidPalindromeVisualizer({
  data = "A man, a plan, a canal: Panama",
}: ValidPalindromeVisualizerProps) {
  const [input, setInput] = useState(data);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [cleaned, setCleaned] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [leftPointer, setLeftPointer] = useState<number | null>(null);
  const [rightPointer, setRightPointer] = useState<number | null>(null);
  const [speed, setSpeed] = useState(800);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const cleanString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
  };

  const initializeVisualization = useCallback(() => {
    const cleanedStr = cleanString(input);
    setCleaned(cleanedStr);

    const chars: CharState[] = cleanedStr.split("").map((char, index) => ({
      char,
      index,
      originalIndex: index,
      state: "default",
    }));

    setCharStates(chars);
    setCurrentStep(0);
    setResult(null);
    setLeftPointer(null);
    setRightPointer(null);
    setIsPlaying(false);

    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, [input]);

  useEffect(() => {
    initializeVisualization();
  }, [initializeVisualization]);

  const executeStep = useCallback(() => {
    const cleanedStr = cleanString(input);
    const totalSteps = Math.ceil(cleanedStr.length / 2);

    if (cleanedStr.length === 0) {
      setResult(true);
      setIsPlaying(false);
      return;
    }

    if (currentStep >= totalSteps) {
      setResult(true);
      setIsPlaying(false);
      setCharStates((prev) =>
        prev.map((char) => ({ ...char, state: "complete" }))
      );
      return;
    }

    const left = currentStep;
    const right = cleanedStr.length - 1 - currentStep;

    setLeftPointer(left);
    setRightPointer(right);

    if (cleanedStr[left] === cleanedStr[right]) {
      // Match
      setCharStates((prev) =>
        prev.map((char, idx) => {
          if (idx === left || idx === right) {
            return { ...char, state: "match", isLeft: idx === left, isRight: idx === right };
          }
          return char;
        })
      );

      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else {
      // Mismatch
      setCharStates((prev) =>
        prev.map((char, idx) => {
          if (idx === left || idx === right) {
            return { ...char, state: "mismatch", isLeft: idx === left, isRight: idx === right };
          }
          return char;
        })
      );

      setResult(false);
      setIsPlaying(false);
    }
  }, [input, currentStep, speed]);

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

  const getCharColor = (state: CharState["state"]) => {
    switch (state) {
      case "match":
        return "bg-emerald-600/90 border-emerald-400 text-white";
      case "mismatch":
        return "bg-red-600/90 border-red-400 text-white";
      case "complete":
        return "bg-purple-600/80 border-purple-400 text-white";
      case "active":
        return "bg-blue-600/80 border-blue-400 text-white";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-300";
    }
  };

  return (
    <div className="w-full space-y-6 my-8 p-6 border border-neutral-700 rounded-xl">
      {/* Input Control */}
      <div className="space-y-3">
        <label className="text-sm text-neutral-400">Input String:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm"
          placeholder="Enter a string..."
        />
        <div className="text-xs text-neutral-500">
          Cleaned: <span className="font-mono text-neutral-400">&quot;{cleaned}&quot;</span>
        </div>
      </div>

      {/* Character Visualization */}
      <div className="min-h-32 flex items-center justify-center">
        {charStates.length === 0 ? (
          <div className="text-neutral-500 text-sm">Enter a string to visualize</div>
        ) : (
          <div className="flex gap-2 flex-wrap justify-center">
            <AnimatePresence>
              {charStates.map((charState, idx) => (
                <motion.div
                  key={charState.originalIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <div
                    className={`
                      w-12 h-12 flex items-center justify-center
                      border-2 rounded-lg font-mono text-lg font-semibold
                      transition-all duration-300
                      ${getCharColor(charState.state)}
                    `}
                  >
                    {charState.char}
                  </div>

                  {/* Pointer Labels */}
                  {leftPointer === idx && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-blue-400 font-semibold whitespace-nowrap">
                      ← left
                    </div>
                  )}
                  {rightPointer === idx && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-purple-400 font-semibold whitespace-nowrap">
                      right →
                    </div>
                  )}

                  {/* Index */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-neutral-600 font-mono">
                    {idx}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded border text-center font-semibold ${
            result
              ? "bg-emerald-900/20 border-emerald-700/40 text-emerald-400"
              : "bg-red-900/20 border-red-700/40 text-red-400"
          }`}
        >
          {result ? "✓ Valid Palindrome" : "✗ Not a Palindrome"}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 items-center flex-wrap">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-medium rounded transition-colors"
            disabled={charStates.length === 0}
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
          disabled={isPlaying || result !== null || charStates.length === 0}
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
            min="200"
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
          <span className="text-neutral-400">Default</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-400"></div>
          <span className="text-neutral-400">Match</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600 border border-red-400"></div>
          <span className="text-neutral-400">Mismatch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-600 border border-purple-400"></div>
          <span className="text-neutral-400">Complete</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-900/10 border border-blue-700/30 rounded">
        <p className="text-sm text-neutral-400">
          <strong className="text-blue-400">Two Pointers:</strong> The algorithm uses two pointers
          starting from opposite ends. They move inward, comparing characters at each step.
          If all pairs match, it&apos;s a valid palindrome.
        </p>
      </div>
    </div>
  );
}
