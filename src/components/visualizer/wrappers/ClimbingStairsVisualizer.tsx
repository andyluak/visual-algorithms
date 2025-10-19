"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ClimbingStairsVisualizerProps {
  n?: number;
}

interface DPState {
  index: number;
  value: number | null;
  state: "default" | "computing" | "computed" | "current" | "highlight";
}

export function ClimbingStairsVisualizer({
  n = 5,
}: ClimbingStairsVisualizerProps) {
  const [stairs, setStairs] = useState(n);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dpStates, setDpStates] = useState<DPState[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [speed, setSpeed] = useState(800);
  const [formula, setFormula] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showPaths, setShowPaths] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const initializeVisualization = useCallback(() => {
    const dp: DPState[] = Array.from({ length: stairs + 1 }, (_, i) => ({
      index: i,
      value: null,
      state: "default",
    }));

    setDpStates(dp);
    setCurrentStep(0);
    setResult(null);
    setFormula("");
    setExplanation("Click Play to start building the DP solution");
    setIsPlaying(false);

    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, [stairs]);

  useEffect(() => {
    initializeVisualization();
  }, [initializeVisualization]);

  const executeStep = useCallback(() => {
    setDpStates((prevStates) => {
      const newStates = [...prevStates];

      if (currentStep === 0) {
        newStates[0] = { ...newStates[0], value: 1, state: "highlight" };
        setFormula("dp[0] = 1");
        setExplanation("Base case: 1 way to stay at ground (step 0)");

        animationRef.current = setTimeout(() => {
          setCurrentStep(1);
        }, speed);

        return newStates;
      }

      if (currentStep === 1) {
        newStates[0] = { ...newStates[0], state: "computed" };
        newStates[1] = { ...newStates[1], value: 1, state: "highlight" };
        setFormula("dp[1] = 1");
        setExplanation("Base case: 1 way to reach step 1 (take one step)");

        animationRef.current = setTimeout(() => {
          setCurrentStep(2);
        }, speed);

        return newStates;
      }

      const i = currentStep;

      if (i > stairs) {
        const finalValue = newStates[stairs]?.value ?? 0;
        setResult(finalValue);
        setIsPlaying(false);
        setFormula(`Result: ${finalValue} ways`);
        setExplanation(`Complete! ${finalValue} distinct ways to climb ${stairs} stairs.`);

        newStates[stairs] = { ...newStates[stairs], state: "highlight" };
        return newStates;
      }

      const prev1Value = newStates[i - 1]?.value ?? 0;
      const prev2Value = newStates[i - 2]?.value ?? 0;
      const sum = prev1Value + prev2Value;

      newStates.forEach((dp, idx) => {
        if (idx === i) {
          newStates[idx] = { ...dp, state: "computing" };
        } else if (idx === i - 1 || idx === i - 2) {
          newStates[idx] = { ...dp, state: "current" };
        } else if (dp.value !== null) {
          newStates[idx] = { ...dp, state: "computed" };
        }
      });

      setFormula(`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${prev1Value} + ${prev2Value} = ${sum}`);
      setExplanation(`Step ${i}: ${prev1Value} ways (from ${i-1}) + ${prev2Value} ways (from ${i-2}) = ${sum} total ways`);

      animationRef.current = setTimeout(() => {
        setDpStates((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], value: sum, state: "computed" };
          updated.forEach((dp, idx) => {
            if (idx !== i && dp.value !== null) {
              updated[idx] = { ...dp, state: "computed" };
            }
          });
          return updated;
        });
        setCurrentStep(i + 1);
      }, speed);

      return newStates;
    });
  }, [currentStep, stairs, speed]);

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
    if (result !== null || currentStep > stairs) {
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
    if (!isPlaying && result === null && currentStep <= stairs) {
      executeStep();
    }
  };

  const getStepColor = (state: DPState["state"]) => {
    switch (state) {
      case "highlight":
        return "bg-purple-600 border-purple-400 text-fd-primary-foreground";
      case "computing":
        return "bg-yellow-600 border-yellow-400 text-fd-primary-foreground";
      case "computed":
        return "bg-emerald-600 border-emerald-400 text-fd-primary-foreground";
      case "current":
        return "bg-blue-600 border-blue-400 text-fd-primary-foreground";
      default:
        return "bg-fd-muted border-fd-border text-fd-muted-foreground";
    }
  };

  const getStairColor = (idx: number) => {
    const dpState = dpStates[idx + 1];
    if (!dpState) return "bg-fd-secondary border-fd-border text-fd-primary-foreground";

    switch (dpState.state) {
      case "highlight":
        return "bg-purple-600 border-purple-500 text-fd-primary-foreground";
      case "computing":
        return "bg-yellow-600 border-yellow-500 text-fd-primary-foreground";
      case "computed":
        return "bg-emerald-600 border-emerald-500 text-fd-primary-foreground";
      case "current":
        return "bg-blue-600 border-blue-500 text-fd-primary-foreground";
      default:
        return "bg-fd-secondary border-fd-border text-fd-primary-foreground";
    }
  };

  const getExamplePaths = (n: number) => {
    if (n <= 0) return [];
    if (n === 1) return [[1]];
    if (n === 2) return [[1, 1], [2]];
    if (n === 3) return [[1, 1, 1], [1, 2], [2, 1]];
    if (n === 4) return [[1, 1, 1, 1], [1, 1, 2], [1, 2, 1], [2, 1, 1], [2, 2]];
    if (n === 5) return [[1, 1, 1, 1, 1], [1, 1, 1, 2], [1, 1, 2, 1], [1, 2, 1, 1], [2, 1, 1, 1], [1, 2, 2], [2, 1, 2], [2, 2, 1]];
    return [];
  };

  return (
    <div className="w-full space-y-6 my-8 p-6 border border-fd-border rounded-xl">
      {/* Input Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-fd-foreground">Number of Stairs (n):</label>
          <input
            type="number"
            value={stairs}
            onChange={(e) => setStairs(Math.max(1, Math.min(10, Number(e.target.value))))}
            min="1"
            max="10"
            className="w-full px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm"
          />
          <div className="text-xs text-fd-muted-foreground">Range: 1-10 stairs</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-fd-foreground">Options:</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-fd-muted-foreground">Show example paths (n ≤ 5)</span>
          </label>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="p-3 bg-blue-950 border border-blue-700 rounded">
          <p className="text-sm text-blue-100">{explanation}</p>
        </div>
      )}

      {/* Visual Staircase */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-fd-foreground">Staircase:</h3>
        <div className="relative flex items-end justify-center gap-1 min-h-48 p-4 border border-fd-border rounded">
          {Array.from({ length: stairs }, (_, i) => {
            const heightPercent = ((i + 1) / stairs) * 100;
            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ height: `${Math.max(heightPercent, 20)}%` }}
              >
                <div className="flex-1 flex items-end w-full">
                  <div
                    className={`w-12 border-2 rounded-t transition-all duration-300 ${getStairColor(i)} h-full flex flex-col items-center justify-start pt-1 px-1`}
                  >
                    <span className="text-xs font-bold">{i + 1}</span>
                    {dpStates[i + 1] && dpStates[i + 1].value !== null && (
                      <div className="mt-1 text-xs font-mono">
                        {dpStates[i + 1].value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DP Array */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-fd-foreground">DP Array:</h3>
        <div className="flex gap-2 flex-wrap justify-center p-4 border border-fd-border rounded">
          {dpStates.map((dp) => (
            <div key={dp.index} className="relative">
              <div
                className={`
                  w-16 h-16 flex flex-col items-center justify-center gap-0.5
                  border-2 rounded-lg font-mono transition-all duration-300
                  ${getStepColor(dp.state)}
                `}
              >
                <div className="text-[10px]">dp[{dp.index}]</div>
                <div className="text-xl font-bold">
                  {dp.value !== null ? dp.value : "?"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula */}
      {formula && (
        <div className="p-3 bg-yellow-950 border border-yellow-700 rounded text-center">
          <code className="text-sm text-yellow-100 font-mono">{formula}</code>
        </div>
      )}

      {/* Example Paths */}
      {showPaths && stairs <= 5 && getExamplePaths(stairs).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fd-foreground">Example Paths (n={stairs}):</h3>
          <div className="p-3 bg-fd-muted border border-fd-border rounded space-y-1.5">
            {getExamplePaths(stairs).map((path, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono text-fd-foreground">
                <span className="text-fd-muted-foreground w-4">{idx + 1}.</span>
                <div className="flex gap-1">
                  {path.map((step, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded ${step === 1 ? 'bg-blue-600 text-fd-primary-foreground' : 'bg-purple-600 text-fd-primary-foreground'}`}>
                        {step}
                      </span>
                      {i < path.length - 1 && <span className="text-fd-muted-foreground">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result !== null && (
        <div className="p-4 bg-emerald-950 border border-emerald-700 rounded text-center">
          <div className="text-lg font-semibold text-emerald-300">
            ✓ Result: <span className="text-2xl">{result}</span> distinct ways
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 items-center flex-wrap">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded transition-colors"
            disabled={dpStates.length === 0}
          >
            {result !== null || currentStep > stairs ? "Restart" : "Play"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors"
          >
            Pause
          </button>
        )}

        <button
          onClick={handleStepForward}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPlaying || result !== null || dpStates.length === 0 || currentStep > stairs}
        >
          Step
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-fd-secondary hover:bg-fd-accent text-fd-secondary-foreground text-sm font-medium rounded transition-colors"
        >
          Reset
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <label className="text-sm font-semibold text-fd-foreground">Speed:</label>
          <input
            type="range"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            min="300"
            max="2000"
            step="100"
            className="w-32"
          />
          <span className="text-xs text-fd-muted-foreground font-mono">{speed}ms</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-fd-muted border border-fd-border"></div>
          <span className="text-fd-muted-foreground">Not Computed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600 border border-blue-400"></div>
          <span className="text-fd-muted-foreground">Used in Calc</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-600 border border-yellow-400"></div>
          <span className="text-fd-muted-foreground">Computing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-400"></div>
          <span className="text-fd-muted-foreground">Computed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-600 border border-purple-400"></div>
          <span className="text-fd-muted-foreground">Highlighted</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-purple-950 border border-purple-700 rounded">
        <p className="text-sm text-purple-100">
          <strong className="text-purple-300">DP Pattern:</strong> dp[i] = dp[i-1] + dp[i-2].
          To reach step i, you either came from step i-1 (take 1 step) or step i-2 (take 2 steps).
        </p>
      </div>
    </div>
  );
}
