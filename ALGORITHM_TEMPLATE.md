# Algorithm Template

This template provides a standardized structure for all algorithm pages. Copy this template when creating a new algorithm page and replace all `{{PLACEHOLDERS}}`.

---

https://fumadocs.dev/docs/ui/theme - Theme Guide

## MDX File Structure

```mdx
---
title: {{TITLE}}
description: {{SHORT_DESCRIPTION}}
difficulty: {{Easy|Medium|Hard}}
tags: [{{tag1}}, {{tag2}}, {{tag3}}]
patterns: [{{pattern1}}, {{pattern2}}]
timeComplexity: {{OPTIMAL_TIME}}
spaceComplexity: {{OPTIMAL_SPACE}}
---

import { DifficultyBadge } from '@/components/mdx/DifficultyBadge';
import { TagList } from '@/components/mdx/TagList';
import { ComplexityTable } from '@/components/mdx/ComplexityTable';
import { SolutionSection } from '@/components/mdx/SolutionSection';
import { {{VisualizerComponent}} } from '@/components/visualizer/wrappers/{{VisualizerComponent}}';

<div className="flex items-center gap-3 mb-6">
  <DifficultyBadge difficulty="{{Easy|Medium|Hard}}" />
  <TagList tags={['{{tag1}}', '{{tag2}}', '{{tag3}}']} />
</div>

## Problem

{{CLEAR_PROBLEM_STATEMENT}}

**Constraints:**
- {{constraint1}}
- {{constraint2}}
- {{constraint3}}

**Examples:**

```

Input: {{example_input_1}}
Output: {{example_output_1}}
Explanation: {{explanation_1}}

```

```

Input: {{example_input_2}}
Output: {{example_output_2}}
Explanation: {{explanation_2}}

````

## Visualization

<{{VisualizerComponent}} data={[{{example_data}}]} {{params}} />

## Solutions

### Approach 1: Brute Force (Naive)

{{DESCRIBE_BRUTE_FORCE_APPROACH}}

<ComplexityTable time="{{BRUTE_FORCE_TIME}}" space="{{BRUTE_FORCE_SPACE}}" />

```{{language}}
{{BRUTE_FORCE_CODE}}
````

**Pros:**

- {{pro1}}
- {{pro2}}

**Cons:**

- {{con1}}
- {{con2}}

---

### Approach 2: {{INTERMEDIATE_APPROACH_NAME}}

{{DESCRIBE_INTERMEDIATE_APPROACH}}

<ComplexityTable time="{{INTERMEDIATE_TIME}}" space="{{INTERMEDIATE_SPACE}}" />

```{{language}}
{{INTERMEDIATE_CODE}}
```

**Key Improvements:**

- {{improvement1}}
- {{improvement2}}

---

### Approach 3: {{OPTIMAL_APPROACH_NAME}} ⭐ (Optimal)

{{DESCRIBE_OPTIMAL_APPROACH}}

<ComplexityTable time="{{OPTIMAL_TIME}}" space="{{OPTIMAL_SPACE}}" />

```{{language}}
{{OPTIMAL_CODE}}
```

**Why This Works:**

1. {{reason1}}
2. {{reason2}}
3. {{reason3}}

## Tricks & Key Insights

### Pattern Recognition

- **When to use this pattern:** {{PATTERN_USAGE_SCENARIO}}
- **Key indicator:** {{PATTERN_INDICATOR}}

### Core Tricks

1. **{{TRICK_1_NAME}}**: {{TRICK_1_DESCRIPTION}}
2. **{{TRICK_2_NAME}}**: {{TRICK_2_DESCRIPTION}}
3. **{{TRICK_3_NAME}}**: {{TRICK_3_DESCRIPTION}}

### Common Pitfalls

- ⚠️ {{PITFALL_1}}
- ⚠️ {{PITFALL_2}}
- ⚠️ {{PITFALL_3}}

### Edge Cases to Consider

- {{EDGE_CASE_1}}
- {{EDGE_CASE_2}}
- {{EDGE_CASE_3}}

## Related Problems

- [{{Related Problem 1}}]({{link1}}) - {{similarity1}}
- [{{Related Problem 2}}]({{link2}}) - {{similarity2}}
- [{{Related Problem 3}}]({{link3}}} - {{similarity3}}

```

---

## Frontmatter Field Guide

### Required Fields
- **title**: Algorithm name (e.g., "Two Sum", "Binary Search")
- **description**: One-line description (50-100 chars)
- **difficulty**: `Easy`, `Medium`, or `Hard`
- **tags**: Array of topic tags for search/filtering
- **patterns**: Array of algorithmic patterns used
- **timeComplexity**: Optimal solution time complexity
- **spaceComplexity**: Optimal solution space complexity

### Tag Categories

**Data Structures:**
`array`, `hash-map`, `linked-list`, `stack`, `queue`, `tree`, `graph`, `heap`, `trie`

**Algorithms:**
`two-pointers`, `sliding-window`, `binary-search`, `dfs`, `bfs`, `backtracking`, `dynamic-programming`, `greedy`, `divide-and-conquer`

**Patterns:**
`prefix-sum`, `kadane`, `floyd-cycle`, `topological-sort`, `union-find`, `monotonic-stack`, `interval-merge`

**Concepts:**
`sorting`, `searching`, `recursion`, `iteration`, `in-place`, `string-manipulation`, `math`, `bit-manipulation`

---

## Common Tricks by Pattern

### Array/Hash Map Patterns
- **Complement Search**: For target sums, look for `target - current`
- **Frequency Counting**: Use hash map to track element occurrences
- **Index Mapping**: Map values to indices for O(1) lookups
- **Seen Set**: Track visited elements to detect duplicates/cycles

### Two Pointers Patterns
- **Opposite Ends**: Start from both ends, move toward center
- **Same Direction**: Fast/slow pointers for cycle detection
- **Sliding Window**: Expand/contract window for subarrays
- **Partition**: QuickSort-style partitioning around pivot

### Tree/Graph Patterns
- **Level-Order Traversal**: BFS with queue for level processing
- **Path Tracking**: DFS with backtracking for all paths
- **Post-Order**: Process children before parent (bottom-up)
- **Visited Set**: Track visited nodes to avoid cycles

### Dynamic Programming Patterns
- **Memoization**: Cache subproblem results (top-down)
- **Tabulation**: Build table iteratively (bottom-up)
- **State Transition**: Define `dp[i]` relationship to `dp[i-1]`, `dp[i-2]`, etc.
- **Space Optimization**: Reduce 2D DP to 1D when only previous row needed

### Binary Search Patterns
- **Search Space**: Define what you're searching (index, value, answer)
- **Boundary Conditions**: Handle `left`, `right`, `mid` carefully
- **Invariant**: Maintain property that answer is always in `[left, right]`
- **Template**: Use consistent template to avoid off-by-one errors

---

## Example: Two Sum Filled Template

See `content/docs/arrays-hash-maps/two-sum.mdx` for a complete example of this template in use.

---

## Writing Guidelines

1. **Be Concise**: Each section should be clear and to-the-point
2. **Code Quality**: Include proper variable names, comments for tricky parts
3. **Visual Clarity**: Use code blocks, tables, badges for scanability
4. **Progressive Complexity**: Start with brute force, end with optimal
5. **Practical Insights**: Focus on "why" and "when", not just "what"
6. **Searchable**: Use consistent tags and pattern names across all pages
```
