"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { create } from "zustand";

interface CacheNode {
  key: number;
  value: number;
  id: string;
}

interface Operation {
  type: 'get' | 'put';
  key: number;
  value?: number;
  result?: number | string;
  evicted?: number;
  timestamp: number;
}

interface LRUCacheState {
  cache: CacheNode[];
  capacity: number;
  operations: Operation[];
  get: (key: number) => number;
  put: (key: number, value: number) => void;
  reset: (capacity: number) => void;
}

const useLRUCacheStore = create<LRUCacheState>((set, get) => ({
  cache: [],
  capacity: 3,
  operations: [],

  get: (key: number) => {
    const state = get();
    const index = state.cache.findIndex((node) => node.key === key);

    if (index === -1) {
      set({
        operations: [
          ...state.operations,
          { type: 'get', key, result: -1, timestamp: Date.now() },
        ],
      });
      return -1;
    }

    const newCache = [...state.cache];
    const [node] = newCache.splice(index, 1);
    newCache.push(node);

    set({
      cache: newCache,
      operations: [
        ...state.operations,
        { type: 'get', key, result: node.value, timestamp: Date.now() },
      ],
    });

    return node.value;
  },

  put: (key: number, value: number) => {
    const state = get();
    const newCache = [...state.cache];
    const existingIndex = newCache.findIndex((node) => node.key === key);
    let evicted: number | undefined;

    if (existingIndex !== -1) {
      newCache.splice(existingIndex, 1);
      newCache.push({ key, value, id: `${key}-${Date.now()}` });
    } else {
      if (newCache.length >= state.capacity) {
        const evictedNode = newCache.shift();
        evicted = evictedNode?.key;
      }
      newCache.push({ key, value, id: `${key}-${Date.now()}` });
    }

    set({
      cache: newCache,
      operations: [
        ...state.operations,
        { type: 'put', key, value, evicted, timestamp: Date.now() },
      ],
    });
  },

  reset: (capacity: number) => {
    set({
      cache: [],
      capacity,
      operations: [],
    });
  },
}));

interface LRUCacheVisualizerProps {
  capacity?: number;
}

export function LRUCacheVisualizer({ capacity = 3 }: LRUCacheVisualizerProps) {
  const { cache, operations, get, put, reset } = useLRUCacheStore();
  const [editableCapacity, setEditableCapacity] = useState(capacity);
  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleReset = useCallback(() => {
    reset(editableCapacity);
  }, [editableCapacity, reset]);

  const handleGet = useCallback(() => {
    if (inputKey === "") return;
    get(parseInt(inputKey, 10));
    setInputKey("");
  }, [inputKey, get]);

  const handlePut = useCallback(() => {
    if (inputKey === "" || inputValue === "") return;
    put(parseInt(inputKey, 10), parseInt(inputValue, 10));
    setInputKey("");
    setInputValue("");
  }, [inputKey, inputValue, put]);

  const handleQuickAction = (action: 'scenario1' | 'scenario2') => {
    reset(editableCapacity);

    if (action === 'scenario1') {
      setTimeout(() => put(1, 1), 100);
      setTimeout(() => put(2, 2), 300);
      setTimeout(() => get(1), 500);
      setTimeout(() => put(3, 3), 700);
      setTimeout(() => get(2), 900);
      setTimeout(() => put(4, 4), 1100);
    } else if (action === 'scenario2') {
      setTimeout(() => put(1, 100), 100);
      setTimeout(() => put(2, 200), 300);
      setTimeout(() => put(3, 300), 500);
      setTimeout(() => put(1, 111), 700);
      setTimeout(() => get(2), 900);
    }
  };

  return (
    <div className='w-full space-y-6 my-8 p-6 border border-fd-border rounded-xl bg-fd-card'>
      {/* Controls */}
      <div className='space-y-4'>
        <div className='flex gap-3 items-center flex-wrap'>
          <div className='flex items-center gap-2'>
            <label className='text-sm text-fd-muted-foreground'>Capacity:</label>
            <input
              type='number'
              value={editableCapacity}
              onChange={(e) => setEditableCapacity(Number(e.target.value))}
              min='1'
              max='10'
              className='w-20 px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm'
            />
          </div>

          <button
            onClick={handleReset}
            className='px-4 py-2 bg-fd-secondary hover:bg-fd-accent text-fd-secondary-foreground text-sm font-medium rounded transition-colors'
          >
            Reset
          </button>

          <div className='ml-auto flex gap-2'>
            <button
              onClick={() => handleQuickAction('scenario1')}
              className='px-3 py-2 bg-fd-primary hover:bg-fd-primary/90 text-fd-primary-foreground text-xs font-medium rounded transition-colors'
            >
              Demo: Classic
            </button>
            <button
              onClick={() => handleQuickAction('scenario2')}
              className='px-3 py-2 bg-fd-primary hover:bg-fd-primary/90 text-fd-primary-foreground text-xs font-medium rounded transition-colors'
            >
              Demo: Update
            </button>
          </div>
        </div>

        {/* Operation Inputs */}
        <div className='flex gap-3 items-end flex-wrap'>
          <div className='flex gap-2 items-end'>
            <div>
              <label className='text-xs text-fd-muted-foreground block mb-1'>Key</label>
              <input
                type='number'
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder='Key'
                className='w-20 px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm'
              />
            </div>
            <button
              onClick={handleGet}
              disabled={inputKey === ""}
              className='px-4 py-2 bg-fd-primary hover:bg-fd-primary/90 disabled:bg-fd-muted disabled:opacity-50 text-fd-primary-foreground text-sm font-medium rounded transition-colors'
            >
              Get
            </button>
          </div>

          <div className='flex gap-2 items-end'>
            <div>
              <label className='text-xs text-fd-muted-foreground block mb-1'>Key</label>
              <input
                type='number'
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder='Key'
                className='w-20 px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm'
              />
            </div>
            <div>
              <label className='text-xs text-fd-muted-foreground block mb-1'>Value</label>
              <input
                type='number'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Value'
                className='w-20 px-3 py-2 bg-fd-muted border border-fd-border rounded text-fd-foreground text-sm'
              />
            </div>
            <button
              onClick={handlePut}
              disabled={inputKey === "" || inputValue === ""}
              className='px-4 py-2 bg-fd-primary hover:bg-fd-primary/90 disabled:bg-fd-muted disabled:opacity-50 text-fd-primary-foreground text-sm font-medium rounded transition-colors'
            >
              Put
            </button>
          </div>
        </div>
      </div>

      {/* Cache Visualization */}
      <div className='space-y-3'>
        <div className='flex justify-between items-center'>
          <h3 className='text-sm font-medium text-fd-foreground'>
            Cache State: {cache.length} / {editableCapacity}
          </h3>
          <div className='text-xs text-fd-muted-foreground'>
            <span>← LRU</span>
            {" · "}
            <span>MRU →</span>
          </div>
        </div>

        <div className='min-h-32 p-4 bg-fd-muted rounded-lg border border-fd-border'>
          <div className='flex gap-3 items-center overflow-x-auto pb-2'>
            {cache.length === 0 ? (
              <div className='w-full text-center text-fd-muted-foreground text-sm py-8'>
                Cache is empty. Use Put to add items.
              </div>
            ) : (
              <>
                <div className='flex-shrink-0 text-xs text-fd-muted-foreground font-medium'>
                  LRU
                </div>

                <AnimatePresence mode="popLayout">
                  {cache.map((node, index) => (
                    <motion.div
                      key={node.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, x: -50 }}
                      transition={{
                        layout: { duration: 0.3 },
                        opacity: { duration: 0.2 },
                      }}
                      className='flex-shrink-0'
                    >
                      <div className='relative'>
                        <div
                          className={`w-24 h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
                            index === cache.length - 1
                              ? "border-fd-primary bg-fd-accent"
                              : index === 0
                              ? "border-fd-border bg-fd-muted"
                              : "border-fd-border bg-fd-background"
                          }`}
                        >
                          <div className='text-xs text-fd-muted-foreground font-mono'>
                            key
                          </div>
                          <div className='text-2xl font-bold text-fd-foreground'>
                            {node.key}
                          </div>
                          <div className='text-xs text-fd-muted-foreground'>
                            val: <span className='text-fd-foreground'>{node.value}</span>
                          </div>
                        </div>

                        <div className='absolute -top-2 -right-2 w-5 h-5 rounded-full bg-fd-secondary border border-fd-border flex items-center justify-center text-xs text-fd-muted-foreground'>
                          {index}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className='flex-shrink-0 text-xs text-fd-muted-foreground font-medium'>
                  MRU
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hash Map Visualization */}
        <div className='p-3 bg-fd-muted rounded border border-fd-border'>
          <div className='text-xs text-fd-muted-foreground mb-2 font-medium'>
            Hash Map: {cache.length > 0 ? `{ ${cache.map(n => `${n.key}: ${n.value}`).join(', ')} }` : '{ }'}
          </div>
        </div>
      </div>

      {/* Operations Log */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-fd-foreground'>
          Operations Log:
        </h3>
        <div className='max-h-64 overflow-y-auto space-y-1 p-3 bg-fd-muted rounded border border-fd-border'>
          <AnimatePresence>
            {operations.length === 0 ? (
              <div className='text-center text-fd-muted-foreground text-sm py-4'>
                No operations yet. Try Get or Put operations.
              </div>
            ) : (
              [...operations].reverse().map((op, idx) => (
                <motion.div
                  key={`${op.timestamp}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className='flex items-center gap-3 p-2 rounded text-sm bg-fd-accent border border-fd-border'
                >
                  <div className='flex-1 font-mono text-fd-foreground'>
                    {op.type === 'get' ? (
                      <>
                        <span>get({op.key})</span>
                        <span className='text-fd-muted-foreground mx-2'>→</span>
                        <span>
                          {op.result}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>put({op.key}, {op.value})</span>
                        {op.evicted !== undefined && (
                          <>
                            <span className='text-fd-muted-foreground mx-2'>|</span>
                            <span>evicted: {op.evicted}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className='text-xs text-fd-muted-foreground'>
                    {new Date(op.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Box */}
      <div className='p-4 bg-fd-accent border border-fd-border rounded'>
        <p className='text-sm text-fd-muted-foreground'>
          <strong className='text-fd-foreground'>How it works:</strong> The cache maintains a fixed capacity.
          Items are ordered by recency - least recently used (LRU) on the left, most recently used (MRU) on the right.
          When capacity is exceeded, the LRU item is evicted. Both get and put operations move items to MRU position.
        </p>
      </div>
    </div>
  );
}
