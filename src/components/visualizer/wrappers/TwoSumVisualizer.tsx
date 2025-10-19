"use client";

import { AlgorithmVisualizer } from "../core/AlgorithmVisualizer";
import type { VisualizerConfig, AlgorithmStep } from "../types";

interface TwoSumVisualizerProps {
  data?: number[];
  target?: number;
  config?: VisualizerConfig;
}

function generateTwoSumStepsWrapper(
  nums: (number | string)[],
  params: Record<string, unknown>,
): AlgorithmStep[] {
  // Extract and validate target
  const target =
    typeof params.target === "number"
      ? params.target
      : parseInt(String(params.target), 10);

  // Convert array to numbers
  const numArray = nums.map((n) =>
    typeof n === "number" ? n : parseInt(String(n), 10),
  );

  const steps: AlgorithmStep[] = [];
  const map = new Map<number, number>();

  // Initial step
  steps.push({
    type: "custom",
    description: `Starting with array [${numArray.join(
      ", ",
    )}], target = ${target}`,
    variables: { target },
  });

  // Iterate through array
  for (let i = 0; i < numArray.length; i++) {
    const current = numArray[i];
    const complement = target - current;

    // Check current element
    steps.push({
      type: "compare",
      indices: [i],
      description: `Check index ${i}: value = ${current}, looking for ${target} - ${current} = ${complement}`,
      variables: { target, current, needed: complement },
      pointers: [{ name: "i", index: i, color: "text-blue-400" }],
      state: "comparing",
    });

    // Check if complement exists in map
    if (map.has(complement)) {
      const j = map.get(complement)!;
      steps.push({
        type: "found",
        indices: [j, i],
        description: `Found! nums[${j}] = ${numArray[j]} and nums[${i}] = ${current} sum to ${target}`,
        variables: { target, result: `[${j}, ${i}]` },
        pointers: [
          { name: "i", index: j, color: "text-green-400" },
          { name: "j", index: i, color: "text-green-400" },
        ],
        state: "found",
      });
      return steps;
    }

    // Add to map
    map.set(current, i);
  }

  // No solution found
  steps.push({
    type: "custom",
    description: "No two numbers sum to the target value",
    variables: { target, result: "No solution" },
  });

  return steps;
}

export function TwoSumVisualizer({
  data = [2, 7, 11, 15],
  target = 9,
  config,
}: TwoSumVisualizerProps) {
  return (
    <AlgorithmVisualizer
      type='array'
      data={data}
      stepGenerator={generateTwoSumStepsWrapper}
      params={{ target }}
      paramConfig={[
        {
          name: "target",
          label: "Target",
          type: "number",
          defaultValue: target,
        },
      ]}
      config={{
        speed: 1,
        autoPlay: false,
        showIndices: true,
        interactive: true,
        ...config,
      }}
    />
  );
}
