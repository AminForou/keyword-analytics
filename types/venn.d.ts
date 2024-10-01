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

    interface VennSet { // No need to export here since it's part of the module augmentation
      sets: string[];
      size: number;
    }
  }
}
