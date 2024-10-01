// types/d3-venn.d.ts

import * as d3 from 'd3';

declare module 'd3' {
  namespace venn {
    function VennDiagram(): VennDiagramInstance;

    interface VennDiagramInstance {
      width(width: number): VennDiagramInstance;
      height(height: number): VennDiagramInstance;
      // Add other methods as needed, with proper return types
    }

    export interface VennSet { // Added export here
      sets: string[];
      size: number;
    }
  }
}