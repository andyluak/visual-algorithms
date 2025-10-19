"use client";

import { useEffect, useState } from "react";
import { useAlgorithmState } from "../hooks/useAlgorithmState";
import { VisualizerControls } from "./VisualizerControls";
import { ArrayVisualizer } from "../visualizers/ArrayVisualizer";
import type { ArrayVisualizerData, AlgorithmStep } from "../types";

type AlgorithmVisualizerProps = ArrayVisualizerData;

export function AlgorithmVisualizer({
  type,
  data: initialData,
  steps: initialSteps,
  config,
  stepGenerator,
  params: initialParams = {},
  paramConfig = [],
}: AlgorithmVisualizerProps) {
  const { setData, setSteps, reset } = useAlgorithmState();
  const [currentData, setCurrentData] = useState(initialData);
  const [, setCurrentSteps] = useState<AlgorithmStep[]>(initialSteps || []);
  const [editableParams, setEditableParams] = useState(initialParams);

  const isInteractive = config?.interactive && stepGenerator;

  const handleRunAlgorithm = (
    newData: (number | string)[],
    newParams: Record<string, unknown>,
  ) => {
    if (!stepGenerator) return;

    const generatedSteps = stepGenerator(newData, newParams);
    setCurrentData(newData);
    setCurrentSteps(generatedSteps);
    setData(newData);
    setSteps(generatedSteps);
    reset();
  };

  const handleParamChange = (name: string, value: unknown) => {
    setEditableParams({ ...editableParams, [name]: value });
  };

  const handleDataChange = (newData: (number | string)[]) => {
    setCurrentData(newData);
    // Auto-regenerate when data changes
    if (isInteractive && stepGenerator) {
      handleRunAlgorithm(newData, editableParams);
    }
  };

  const handleAddItem = () => {
    const newData = [...currentData, 0];
    setCurrentData(newData);
    if (isInteractive && stepGenerator) {
      handleRunAlgorithm(newData, editableParams);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newData = currentData.filter((_, i) => i !== index);
    setCurrentData(newData);
    if (isInteractive && stepGenerator) {
      handleRunAlgorithm(newData, editableParams);
    }
  };

  useEffect(() => {
    if (isInteractive && stepGenerator) {
      // Generate initial steps for interactive mode
      const generatedSteps = stepGenerator(initialData, initialParams);
      setCurrentSteps(generatedSteps);
      setData(initialData);
      setSteps(generatedSteps);
    } else if (initialSteps) {
      // Use provided steps for non-interactive mode
      setData(initialData);
      setSteps(initialSteps);
    }
    reset();
  }, [
    initialData,
    initialSteps,
    initialParams,
    isInteractive,
    stepGenerator,
    setData,
    setSteps,
    reset,
  ]);

  return (
    <div className='w-full space-y-6 my-8'>
      {/* Main Visualizer */}
      <div className='p-8 border border-neutral-700 rounded-xl'>
        {type === "array" && (
          <ArrayVisualizer
            config={config}
            editable={isInteractive}
            onDataChange={handleDataChange}
            onAddItem={isInteractive ? handleAddItem : undefined}
            onRemoveItem={isInteractive ? handleRemoveItem : undefined}
          />
        )}
        {/* Future visualizer types can be added here */}
      </div>

      {/* Controls */}
      <VisualizerControls
        speed={config?.speed}
        onSpeedChange={(speed) => console.log("Speed changed:", speed)}
        params={isInteractive ? editableParams : undefined}
        paramConfig={isInteractive ? paramConfig : []}
        onParamChange={isInteractive ? handleParamChange : undefined}
        onRunAlgorithm={
          isInteractive
            ? () => handleRunAlgorithm(currentData, editableParams)
            : undefined
        }
      />
    </div>
  );
}
