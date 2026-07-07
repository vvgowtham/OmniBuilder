import { create } from 'zustand';

interface BuilderNode {
  id: string;
  nodeType: string;
  parentNodeId: string | null;
  props: Record<string, any>;
  styles: Record<string, any>;
  children: BuilderNode[];
  sortOrder: number;
}

interface BuilderState {
  nodes: BuilderNode[];
  selectedNodeId: string | null;
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
  setNodes: (nodes: BuilderNode[]) => void;
  selectNode: (id: string | null) => void;
  setBreakpoint: (bp: 'desktop' | 'tablet' | 'mobile') => void;
  updateNodeProps: (nodeId: string, props: Record<string, any>) => void;
  updateNodeStyles: (nodeId: string, styles: Record<string, any>) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
  breakpoint: 'desktop',
  isDirty: false,
  setNodes: (nodes) => set({ nodes }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setBreakpoint: (bp) => set({ breakpoint: bp }),
  updateNodeProps: (nodeId, newProps) => {
    const { nodes } = get();
    const update = (ns: BuilderNode[]): BuilderNode[] => ns.map(n => n.id === nodeId ? { ...n, props: { ...n.props, ...newProps } } : { ...n, children: update(n.children) });
    set({ nodes: update(nodes), isDirty: true });
  },
  updateNodeStyles: (nodeId, newStyles) => {
    const { nodes } = get();
    const update = (ns: BuilderNode[]): BuilderNode[] => ns.map(n => n.id === nodeId ? { ...n, styles: { ...n.styles, ...newStyles } } : { ...n, children: update(n.children) });
    set({ nodes: update(nodes), isDirty: true });
  },
}));
