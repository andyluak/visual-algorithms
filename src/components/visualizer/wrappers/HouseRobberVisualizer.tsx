"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface HouseRobberVisualizerProps {
  houses?: number[];
}

interface HouseState {
  index: number;
  value: number;
  dpValue: number | null;
  state:
    | "default"
    | "robbing"
    | "robbed"
    | "skipped"
    | "computed"
    | "highlight";
}

export function HouseRobberVisualizer({
  houses = [2, 7, 9, 3, 1],
}: HouseRobberVisualizerProps) {
  const [houseValues, setHouseValues] = useState<number[]>(houses);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [houseStates, setHouseStates] = useState<HouseState[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1000);
  const [formula, setFormula] = useState("");
  const [explanation, setExplanation] = useState("");
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const initializeVisualization = useCallback(() => {
    const states: HouseState[] = houseValues.map((value, index) => ({
      index,
      value,
      dpValue: null,
      state: "default",
    }));

    setHouseStates(states);
    setCurrentStep(0);
    setResult(null);
    setFormula("");
    setExplanation("Click Play to start finding the maximum loot!");
    setIsPlaying(false);

    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, [houseValues]);

  useEffect(() => {
    initializeVisualization();
  }, [initializeVisualization]);

  const executeStep = useCallback(() => {
    setHouseStates((prevStates) => {
      const newStates = [...prevStates];
      const n = houseValues.length;

      if (currentStep === 0) {
        // Base case: dp[0] = first house value
        newStates[0] = {
          ...newStates[0],
          dpValue: houseValues[0],
          state: "highlight",
        };
        setFormula(`dp[0] = ${houseValues[0]}`);
        setExplanation(
          `Base case: If there's only one house, rob it for $${houseValues[0]}`,
        );

        animationRef.current = setTimeout(() => {
          setCurrentStep(1);
        }, speed);

        return newStates;
      }

      if (currentStep === 1 && n > 1) {
        // Base case: dp[1] = max of first two houses
        const maxValue = Math.max(houseValues[0], houseValues[1]);
        newStates[0] = { ...newStates[0], state: "computed" };
        newStates[1] = {
          ...newStates[1],
          dpValue: maxValue,
          state: "highlight",
        };

        setFormula(
          `dp[1] = max(${houseValues[0]}, ${houseValues[1]}) = ${maxValue}`,
        );
        setExplanation(
          `With 2 houses, rob the one with more money: $${maxValue}`,
        );

        animationRef.current = setTimeout(() => {
          setCurrentStep(2);
        }, speed);

        return newStates;
      }

      const i = currentStep;

      if (i >= n) {
        // Complete
        const finalValue = newStates[n - 1]?.dpValue ?? 0;
        setResult(finalValue);
        setIsPlaying(false);
        setFormula(`Maximum loot: $${finalValue}`);
        setExplanation(
          `Done! You can rob houses for a maximum total of $${finalValue} without triggering alarms.`,
        );

        newStates[n - 1] = { ...newStates[n - 1], state: "highlight" };
        return newStates;
      }

      // Show which houses we're considering
      const robCurrent = (newStates[i - 2]?.dpValue ?? 0) + houseValues[i];
      const skipCurrent = newStates[i - 1]?.dpValue ?? 0;
      const maxValue = Math.max(robCurrent, skipCurrent);

      // Highlight houses involved in decision
      newStates.forEach((house, idx) => {
        if (idx === i) {
          newStates[idx] = { ...house, state: "computed" };
        } else if (idx === i - 1) {
          newStates[idx] = { ...house, state: "skipped" };
        } else if (idx === i - 2) {
          newStates[idx] = { ...house, state: "robbing" };
        } else if (house.dpValue !== null) {
          newStates[idx] = { ...house, state: "computed" };
        }
      });

      setFormula(
        `dp[${i}] = max(rob house ${i}, skip house ${i}) = max(${robCurrent}, ${skipCurrent}) = ${maxValue}`,
      );
      setExplanation(
        `House ${i}: Rob it ($${houseValues[i]} + $${
          newStates[i - 2]?.dpValue ?? 0
        } = $${robCurrent}) OR skip it ($${skipCurrent}). Choose max = $${maxValue}`,
      );

      animationRef.current = setTimeout(() => {
        setHouseStates((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            dpValue: maxValue,
            state: maxValue === robCurrent ? "robbed" : "computed",
          };

          // Reset states
          updated.forEach((house, idx) => {
            if (idx !== i && house.dpValue !== null) {
              updated[idx] = { ...house, state: "computed" };
            }
          });

          return updated;
        });
        setCurrentStep(i + 1);
      }, speed);

      return newStates;
    });
  }, [currentStep, houseValues, speed]);

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
    if (result !== null || currentStep >= houseValues.length) {
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
    if (!isPlaying && result === null && currentStep < houseValues.length) {
      executeStep();
    }
  };

  const handleArrayChange = (value: string) => {
    const newValues = value
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);
    if (newValues.length > 0) {
      setHouseValues(newValues);
    }
  };

  const getHouseColor = (state: HouseState["state"]) => {
    switch (state) {
      case "highlight":
        return "bg-purple-600 border-purple-400";
      case "robbed":
        return "bg-emerald-600 border-emerald-400";
      case "robbing":
        return "bg-blue-600 border-blue-400";
      case "skipped":
        return "bg-orange-600 border-orange-400";
      case "computed":
        return "bg-fd-secondary border-fd-border";
      default:
        return "bg-fd-muted border-fd-border";
    }
  };

  return (
    <div className='w-full space-y-6 my-8 p-6 border border-fd-border rounded-xl'>
      {/* Input Control */}
      <div className='space-y-2'>
        <label className='text-sm font-semibold text-fd-foreground'>
          House Values (comma-separated):
        </label>
        <input
          type='text'
          value={houseValues.join(", ")}
          onChange={(e) => handleArrayChange(e.target.value)}
          className='w-full px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm font-mono'
          placeholder='e.g., 2, 7, 9, 3, 1'
        />
        <div className='text-xs text-fd-muted-foreground'>
          Enter positive integers representing money in each house
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className='p-3 bg-blue-950 border border-blue-700 rounded'>
          <p className='text-sm text-blue-100'>{explanation}</p>
        </div>
      )}

      {/* Houses Visualization */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold text-fd-foreground'>
          Houses on the Street:
        </h3>
        <div className='flex gap-4 flex-wrap justify-center p-6 border border-fd-border rounded'>
          {houseStates.map((house, idx) => (
            <motion.div
              key={house.index}
              animate={{
                scale:
                  house.state === "computed" || house.state === "highlight"
                    ? 1.05
                    : 1,
              }}
              className='relative'
            >
              {/* House */}
              <div
                className={`
                  w-24 h-32 flex flex-col items-center justify-between
                  border-4 rounded-lg transition-all duration-300 p-3
                  ${getHouseColor(house.state)} text-fd-primary-foreground
                `}
              >
                {/* House number */}
                <div className='text-xs font-semibold opacity-80'>
                  House {idx}
                </div>

                {/* House icon */}
                <div className='text-3xl'>🏠</div>

                {/* Money value */}
                <div className='text-lg font-bold'>${house.value}</div>

                {/* DP value */}
                {house.dpValue !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='absolute -top-3 -right-3 w-10 h-10 bg-green-600 border-2 border-green-400 rounded-full flex items-center justify-center text-xs font-bold shadow-lg'
                  >
                    ${house.dpValue}
                  </motion.div>
                )}
              </div>

              {/* Adjacent warning */}
              {idx < houseStates.length - 1 && (
                <div className='absolute -right-2 top-1/2 -translate-y-1/2 text-red-500 text-xl'>
                  🚨
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* DP Array */}
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold text-fd-foreground'>
          DP Array (Max Loot Up To Each House):
        </h3>
        <div className='flex gap-2 flex-wrap justify-center p-4 border border-fd-border rounded'>
          {houseStates.map((house) => (
            <div key={house.index} className='flex flex-col items-center gap-1'>
              <div
                className={`
                  w-16 h-16 flex flex-col items-center justify-center
                  border-2 rounded-lg font-mono transition-all duration-300
                  ${getHouseColor(house.state)} text-fd-primary-foreground
                `}
              >
                <div className='text-[10px]'>dp[{house.index}]</div>
                <div className='text-xl font-bold'>
                  {house.dpValue !== null ? `$${house.dpValue}` : "?"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula */}
      {formula && (
        <div className='p-3 bg-yellow-950 border border-yellow-700 rounded'>
          <code className='text-sm text-yellow-100 font-mono break-all'>
            {formula}
          </code>
        </div>
      )}

      {/* Result */}
      {result !== null && (
        <div className='p-4 bg-emerald-950 border border-emerald-700 rounded text-center'>
          <div className='text-lg font-semibold text-emerald-300'>
            ✓ Maximum Loot: <span className='text-2xl'>${result}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className='flex gap-3 items-center flex-wrap'>
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className='px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded transition-colors'
            disabled={houseStates.length === 0}
          >
            {result !== null || currentStep >= houseValues.length
              ? "Restart"
              : "Play"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors'
          >
            Pause
          </button>
        )}

        <button
          onClick={handleStepForward}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={
            isPlaying ||
            result !== null ||
            houseStates.length === 0 ||
            currentStep >= houseValues.length
          }
        >
          Step
        </button>

        <button
          onClick={handleReset}
          className='px-4 py-2 bg-fd-secondary hover:bg-fd-accent text-fd-secondary-foreground text-sm font-medium rounded transition-colors'
        >
          Reset
        </button>

        <div className='flex items-center gap-3 ml-auto'>
          <label className='text-sm font-semibold text-fd-foreground'>
            Speed:
          </label>
          <input
            type='range'
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            min='500'
            max='2000'
            step='100'
            className='w-32'
          />
          <span className='text-xs text-fd-muted-foreground font-mono'>
            {speed}ms
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className='flex gap-4 flex-wrap text-xs'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-fd-muted border border-fd-border'></div>
          <span className='text-fd-muted-foreground'>Not Visited</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-blue-600 border border-blue-400'></div>
          <span className='text-fd-muted-foreground'>Rob This (i-2)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-orange-600 border border-orange-400'></div>
          <span className='text-fd-muted-foreground'>Skip This (i-1)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-yellow-600 border border-yellow-400'></div>
          <span className='text-fd-muted-foreground'>Computing</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-emerald-600 border border-emerald-400'></div>
          <span className='text-fd-muted-foreground'>Robbed</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-purple-600 border border-purple-400'></div>
          <span className='text-fd-muted-foreground'>Result</span>
        </div>
      </div>

      {/* Info */}
      <div className='p-3 bg-red-950 border border-red-700 rounded'>
        <p className='text-sm text-red-100'>
          <strong className='text-red-300'>Constraint:</strong> Can&apos;t rob
          adjacent houses (alarm 🚨 triggers!).
          <br />
          <strong className='text-purple-300'>DP Pattern:</strong> dp[i] =
          max(rob house i + dp[i-2], skip house i = dp[i-1])
        </p>
      </div>
    </div>
  );
}
