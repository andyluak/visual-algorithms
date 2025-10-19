import type { AlgorithmStep } from '../types';

export function generateTwoSumSteps(
  nums: number[],
  target: number
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const map = new Map<number, number>();

  // Initial step
  steps.push({
    type: 'custom',
    description: `Starting with array [${nums.join(', ')}], target = ${target}`,
    variables: { target },
  });

  // Iterate through array
  for (let i = 0; i < nums.length; i++) {
    const current = nums[i];
    const complement = target - current;

    // Check current element
    steps.push({
      type: 'compare',
      indices: [i],
      description: `Check index ${i}: value = ${current}, looking for ${target} - ${current} = ${complement}`,
      variables: { target, current, needed: complement },
      pointers: [{ name: 'i', index: i, color: 'text-blue-400' }],
      state: 'comparing',
    });

    // Check if complement exists in map
    if (map.has(complement)) {
      const j = map.get(complement)!;
      steps.push({
        type: 'found',
        indices: [j, i],
        description: `Found! nums[${j}] = ${nums[j]} and nums[${i}] = ${current} sum to ${target}`,
        variables: { target, result: `[${j}, ${i}]` },
        pointers: [
          { name: 'i', index: j, color: 'text-green-400' },
          { name: 'j', index: i, color: 'text-green-400' },
        ],
        state: 'found',
      });
      return steps;
    }

    // Add to map
    map.set(current, i);
  }

  // No solution found
  steps.push({
    type: 'custom',
    description: 'No two numbers sum to the target value',
    variables: { target, result: 'No solution' },
  });

  return steps;
}
