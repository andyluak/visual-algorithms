export type VisualizerType = 'array' | 'tree' | 'graph' | 'linked-list' | 'stack' | 'queue';

export type StepType =
  | 'compare'
  | 'swap'
  | 'highlight'
  | 'pointer-move'
  | 'set-value'
  | 'custom';

export type ElementState =
  | 'default'
  | 'active'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'target'
  | 'found';

export interface Pointer {
  name: string;
  index: number;
  color?: string;
}

export interface AlgorithmStep {
  type: StepType;
  indices?: number[];
  pointers?: Pointer[];
  description: string;
  code?: string;
  variables?: Record<string, unknown>;
  state?: ElementState;
  delay?: number;
}

export type StepGenerator = (
  data: (number | string)[],
  params: Record<string, any>
) => AlgorithmStep[];

export interface ParamConfig {
  name: string;
  label: string;
  type: 'number' | 'string';
  defaultValue: any;
}

export interface VisualizerConfig {
  speed?: number;
  autoPlay?: boolean;
  showIndices?: boolean;
  showValues?: boolean;
  height?: number;
  interactive?: boolean;
  colors?: {
    default?: string;
    active?: string;
    comparing?: string;
    swapping?: string;
    sorted?: string;
    target?: string;
    found?: string;
  };
}

export interface ArrayVisualizerData {
  type: 'array';
  data: (number | string)[];
  steps?: AlgorithmStep[];
  config?: VisualizerConfig;
  stepGenerator?: StepGenerator;
  params?: Record<string, any>;
  paramConfig?: ParamConfig[];
}

export interface VisualizerState {
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  data: (number | string)[];
  activeIndices: Set<number>;
  comparingIndices: Set<number>;
  swappingIndices: Set<number>;
  sortedIndices: Set<number>;
  targetIndices: Set<number>;
  foundIndices: Set<number>;
  pointers: Pointer[];
  variables: Record<string, unknown>;
}
