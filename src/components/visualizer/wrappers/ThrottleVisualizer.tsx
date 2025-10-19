"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { create } from "zustand";

interface ThrottleEvent {
  id: number;
  timestamp: number;
  executed: boolean;
  ignored: boolean;
}

interface ThrottleState {
  events: ThrottleEvent[];
  executionCount: number;
  ignoredCount: number;
  addEvent: (event: ThrottleEvent) => void;
  reset: () => void;
}

const useThrottleStore = create<ThrottleState>((set) => ({
  events: [],
  executionCount: 0,
  ignoredCount: 0,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
      executionCount: event.executed
        ? state.executionCount + 1
        : state.executionCount,
      ignoredCount: event.ignored
        ? state.ignoredCount + 1
        : state.ignoredCount,
    })),
  reset: () =>
    set({
      events: [],
      executionCount: 0,
      ignoredCount: 0,
    }),
}));

interface ThrottleVisualizerProps {
  interval?: number;
}

export function ThrottleVisualizer({ interval = 300 }: ThrottleVisualizerProps) {
  const { events, executionCount, ignoredCount, addEvent, reset } =
    useThrottleStore();
  const [editableInterval, setEditableInterval] = useState(interval);
  const [nextAllowedTime, setNextAllowedTime] = useState<number | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);
  const eventIdCounter = useRef(0);
  const lastExecutionTime = useRef(0);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearIntervalTimer = () => {
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  };

  const handleThrottledCall = useCallback(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime.current;
    const eventId = ++eventIdCounter.current;

    // Check if we should execute
    if (timeSinceLastExecution >= editableInterval) {
      // Execute
      lastExecutionTime.current = now;
      addEvent({
        id: eventId,
        timestamp: now,
        executed: true,
        ignored: false,
      });

      // Set next allowed time
      const nextTime = now + editableInterval;
      setNextAllowedTime(nextTime);
      setTimeUntilNext(editableInterval);

      // Start countdown
      clearIntervalTimer();
      intervalTimerRef.current = setInterval(() => {
        const remaining = nextTime - Date.now();
        if (remaining <= 0) {
          setTimeUntilNext(null);
          setNextAllowedTime(null);
          clearIntervalTimer();
        } else {
          setTimeUntilNext(remaining);
        }
      }, 10);
    } else {
      // Ignore
      addEvent({
        id: eventId,
        timestamp: now,
        executed: false,
        ignored: true,
      });
    }
  }, [editableInterval, addEvent]);

  const handleReset = () => {
    clearIntervalTimer();
    setTimeUntilNext(null);
    setNextAllowedTime(null);
    lastExecutionTime.current = 0;
    eventIdCounter.current = 0;
    reset();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearIntervalTimer();
    };
  }, []);

  const progress =
    timeUntilNext !== null && nextAllowedTime !== null
      ? ((editableInterval - timeUntilNext) / editableInterval) * 100
      : 0;
  const isThrottled = timeUntilNext !== null && timeUntilNext > 0;

  return (
    <div className='w-full space-y-6 my-8 p-6 border border-neutral-700 rounded-xl'>
      {/* Controls */}
      <div className='flex gap-4 items-center flex-wrap'>
        <button
          onClick={handleThrottledCall}
          className='px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white text-sm font-medium rounded transition-colors'
        >
          Trigger Event
        </button>

        <button
          onClick={handleReset}
          className='px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm font-medium rounded transition-colors'
        >
          Reset
        </button>

        <div className='flex items-center gap-3'>
          <label className='text-sm text-neutral-400'>Interval (ms):</label>
          <input
            type='number'
            value={editableInterval}
            onChange={(e) => setEditableInterval(Number(e.target.value))}
            min='100'
            max='2000'
            step='100'
            className='w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm'
          />
        </div>

        <div className='ml-auto flex gap-4 text-sm text-neutral-400'>
          <div>
            Executed: <span className='text-emerald-400 font-semibold'>{executionCount}</span>
          </div>
          <div>
            Ignored: <span className='text-red-400 font-semibold'>{ignoredCount}</span>
          </div>
        </div>
      </div>

      {/* Timer Visualization */}
      <div className='space-y-3'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-neutral-400'>Throttle Status:</span>
          <span className={isThrottled ? "text-red-400" : "text-emerald-400"}>
            {isThrottled ? `Throttled (${Math.ceil(timeUntilNext || 0)}ms remaining)` : "Ready"}
          </span>
        </div>

        <div className='relative h-8 bg-neutral-800 rounded overflow-hidden border border-neutral-700'>
          <AnimatePresence>
            {isThrottled && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                exit={{ width: "100%" }}
                transition={{ duration: 0.01, ease: "linear" }}
                className='absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600/60 to-pink-600/60'
              />
            )}
          </AnimatePresence>

          <div className='absolute inset-0 flex items-center justify-center text-xs font-mono text-neutral-300 z-10'>
            {isThrottled
              ? `Next execution in ${Math.ceil(timeUntilNext || 0)}ms`
              : "Ready to execute"}
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-neutral-300'>Event Timeline:</h3>
        <div className='max-h-64 overflow-y-auto space-y-1 p-3 bg-neutral-800/30 rounded border border-neutral-700'>
          <AnimatePresence>
            {events.length === 0 ? (
              <div className='text-center text-neutral-500 text-sm py-4'>
                Click &quot;Trigger Event&quot; to see throttling in action
              </div>
            ) : (
              [...events].reverse().map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center gap-3 p-2 rounded text-sm ${
                    event.executed
                      ? "bg-emerald-900/20 border border-emerald-700/40"
                      : "bg-red-900/20 border border-red-700/40"
                  }`}
                >
                  <div className='flex-1 font-mono text-neutral-300'>
                    Event #{event.id}
                  </div>
                  <div className='text-xs text-neutral-500'>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className='flex items-center gap-2'>
                    {event.executed && (
                      <span className='px-2 py-1 bg-emerald-700/30 text-emerald-300 rounded text-xs font-medium'>
                        ✓ Executed
                      </span>
                    )}
                    {event.ignored && (
                      <span className='px-2 py-1 bg-red-700/30 text-red-300 rounded text-xs font-medium'>
                        ✕ Ignored
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Box */}
      <div className='p-4 bg-purple-900/10 border border-purple-700/30 rounded'>
        <p className='text-sm text-neutral-400'>
          <strong className='text-purple-400'>Try it:</strong> Click &quot;Trigger Event&quot; multiple
          times rapidly. Notice how it executes immediately, then ignores calls for {editableInterval}ms.
          Unlike debounce, throttle executes at regular intervals.
        </p>
      </div>
    </div>
  );
}
