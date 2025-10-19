import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { AlgorithmVisualizer, TwoSumVisualizer } from '@/components/visualizer';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    AlgorithmVisualizer,
    TwoSumVisualizer,
    ...components,
  };
}
