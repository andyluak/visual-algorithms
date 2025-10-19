"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { create } from "zustand";

interface DebounceEvent {
  id: number;
  timestamp: number;
  executed: boolean;
  cancelled: boolean;
}

interface DebounceState {
  events: DebounceEvent[];
  executionCount: number;
  addEvent: (event: DebounceEvent) => void;
  markExecuted: (id: number) => void;
  markCancelled: (id: number) => void;
  reset: () => void;
}

const useDebounceStore = create<DebounceState>((set) => ({
  events: [],
  executionCount: 0,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  markExecuted: (id) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, executed: true } : e,
      ),
      executionCount: state.executionCount + 1,
    })),
  markCancelled: (id) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, cancelled: true } : e,
      ),
    })),
  reset: () =>
    set({
      events: [],
      executionCount: 0,
    }),
}));

interface DebounceVisualizerProps {
  delay?: number;
}

export function DebounceVisualizer({ delay = 300 }: DebounceVisualizerProps) {
  const {
    events,
    executionCount,
    addEvent,
    markExecuted,
    markCancelled,
    reset,
  } = useDebounceStore();
  const [editableDelay, setEditableDelay] = useState(delay);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const eventIdCounter = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingEventId = useRef<number | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleDebouncedCall = useCallback(() => {
    // Cancel previous pending event
    if (pendingEventId.current !== null) {
      markCancelled(pendingEventId.current);
    }

    // Clear existing timers
    clearTimers();

    // Create new event
    const eventId = ++eventIdCounter.current;
    pendingEventId.current = eventId;
    addEvent({
      id: eventId,
      timestamp: Date.now(),
      executed: false,
      cancelled: false,
    });

    // Start countdown timer
    setTimeLeft(editableDelay);
    setIsTimerActive(true);

    // Update countdown every 10ms for smooth animation
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 10;
      const remaining = editableDelay - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 10);

    // Set the actual execution timer
    timeoutRef.current = setTimeout(() => {
      markExecuted(eventId);
      setIsTimerActive(false);
      setTimeLeft(null);
      pendingEventId.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, editableDelay);
  }, [editableDelay, addEvent, markExecuted, markCancelled]);

  const handleReset = () => {
    clearTimers();
    setTimeLeft(null);
    setIsTimerActive(false);
    pendingEventId.current = null;
    eventIdCounter.current = 0;
    reset();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const progress = timeLeft !== null ? (timeLeft / editableDelay) * 100 : 0;

  return (
    <div className='w-full space-y-6 my-8 p-6 border border-neutral-700 rounded-xl'>
      {/* Controls */}
      <div className='flex gap-4 items-center flex-wrap'>
        <button
          onClick={handleDebouncedCall}
          className='px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors'
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
          <label className='text-sm text-neutral-400'>Delay (ms):</label>
          <input
            type='number'
            value={editableDelay}
            onChange={(e) => setEditableDelay(Number(e.target.value))}
            min='100'
            max='2000'
            step='100'
            className='w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-sm'
          />
        </div>

        <div className='ml-auto text-sm text-neutral-400'>
          Executions:{" "}
          <span className='text-emerald-400 font-semibold'>{executionCount}</span>
        </div>
      </div>

      {/* Timer Visualization */}
      <div className='space-y-3'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-neutral-400'>Timer Status:</span>
          <span
            className={isTimerActive ? "text-amber-400" : "text-neutral-500"}
          >
            {isTimerActive ? `${Math.ceil(timeLeft || 0)}ms remaining` : "Idle"}
          </span>
        </div>

        <div className='relative h-8 bg-neutral-800 rounded overflow-hidden border border-neutral-700'>
          <AnimatePresence>
            {isTimerActive && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                exit={{ width: 0 }}
                transition={{ duration: 0.01, ease: "linear" }}
                className='absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600/60 to-orange-600/60'
              />
            )}
          </AnimatePresence>

          <div className='absolute inset-0 flex items-center justify-center text-xs font-mono text-neutral-300 z-10'>
            {isTimerActive
              ? `${Math.ceil(timeLeft || 0)}ms`
              : "No pending execution"}
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-neutral-300'>
          Event Timeline:
        </h3>
        <div className='max-h-64 overflow-y-auto space-y-1 p-3 bg-neutral-800/30 rounded border border-neutral-700'>
          <AnimatePresence>
            {events.length === 0 ? (
              <div className='text-center text-neutral-500 text-sm py-4'>
                Click &quot;Trigger Event&quot; to see debouncing in action
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
                      : event.cancelled
                      ? "bg-red-900/20 border border-red-700/40"
                      : "bg-amber-900/20 border border-amber-700/40"
                  }`}
                >
                  <div className='flex-1 font-mono text-neutral-300'>Event #{event.id}</div>
                  <div className='text-xs text-neutral-500'>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className='flex items-center gap-2'>
                    {event.executed && (
                      <span className='px-2 py-1 bg-emerald-700/30 text-emerald-300 rounded text-xs font-medium'>
                        ✓ Executed
                      </span>
                    )}
                    {event.cancelled && (
                      <span className='px-2 py-1 bg-red-700/30 text-red-300 rounded text-xs font-medium'>
                        ✕ Cancelled
                      </span>
                    )}
                    {!event.executed && !event.cancelled && (
                      <span className='px-2 py-1 bg-amber-700/30 text-amber-300 rounded text-xs font-medium'>
                        ⏳ Pending
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
      <div className='p-4 bg-blue-900/10 border border-blue-700/30 rounded'>
        <p className='text-sm text-neutral-400'>
          <strong className='text-blue-400'>Try it:</strong> Click &quot;Trigger Event&quot; multiple
          times rapidly. Notice how only the last event executes after{" "}
          {editableDelay}ms of inactivity. Previous pending events are
          cancelled.
        </p>
      </div>
    </div>
  );
}
