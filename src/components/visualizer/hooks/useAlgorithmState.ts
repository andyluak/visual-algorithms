"use client";

import { create } from "zustand";
import type { VisualizerState, AlgorithmStep, Pointer } from "../types";

interface AlgorithmStore extends VisualizerState {
  steps: AlgorithmStep[];
  totalSteps: number;

  // Actions
  setSteps: (steps: AlgorithmStep[]) => void;
  setData: (data: (number | string)[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

export const useAlgorithmState = create<AlgorithmStore>((set, get) => ({
  // Initial state
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  data: [],
  steps: [],
  totalSteps: 0,
  activeIndices: new Set(),
  comparingIndices: new Set(),
  swappingIndices: new Set(),
  sortedIndices: new Set(),
  targetIndices: new Set(),
  foundIndices: new Set(),
  pointers: [],
  variables: {},

  // Actions
  setSteps: (steps) => set({ steps, totalSteps: steps.length }),

  setData: (data) => set({ data }),

  nextStep: () => {
    const { currentStep, totalSteps, steps, data: currentData } = get();
    if (currentStep >= totalSteps - 1) {
      set({ isPlaying: false });
      return;
    }

    const nextStepIndex = currentStep + 1;
    const step = steps[nextStepIndex];

    if (!step) return;

    const newState: Partial<VisualizerState> = {
      currentStep: nextStepIndex,
      activeIndices: new Set(),
      comparingIndices: new Set(),
      swappingIndices: new Set(),
      targetIndices: new Set(),
      foundIndices: new Set(),
    };

    // Apply step changes
    if (step.indices) {
      switch (step.state || step.type) {
        case "active":
          newState.activeIndices = new Set(step.indices);
          break;
        case "comparing":
        case "compare":
          newState.comparingIndices = new Set(step.indices);
          break;
        case "swapping":
        case "swap":
          newState.swappingIndices = new Set(step.indices);
          // Perform swap if needed
          if (step.indices.length === 2) {
            const newData = [...currentData];
            const [i, j] = step.indices;
            [newData[i], newData[j]] = [newData[j], newData[i]];
            newState.data = newData;
          }
          break;
        case "sorted":
          const newSorted = new Set(get().sortedIndices);
          step.indices.forEach((i) => newSorted.add(i));
          newState.sortedIndices = newSorted;
          break;
        case "target":
          newState.targetIndices = new Set(step.indices);
          break;
        case "found":
          newState.foundIndices = new Set(step.indices);
          break;
      }
    }

    if (step.pointers) {
      newState.pointers = step.pointers;
    }

    if (step.variables) {
      newState.variables = { ...get().variables, ...step.variables };
    }

    set(newState);
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep <= 0) return;

    // For now, just go back - in production you'd want to track history
    set({ currentStep: currentStep - 1 });
  },

  goToStep: (step) => {
    const { totalSteps } = get();
    if (step < 0 || step >= totalSteps) return;
    set({ currentStep: step });
  },

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  reset: () =>
    set({
      currentStep: 0,
      isPlaying: false,
      activeIndices: new Set(),
      comparingIndices: new Set(),
      swappingIndices: new Set(),
      sortedIndices: new Set(),
      targetIndices: new Set(),
      foundIndices: new Set(),
      pointers: [],
      variables: {},
    }),

  setSpeed: (speed) => set({ speed }),
}));
