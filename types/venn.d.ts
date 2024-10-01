   // types/venn.d.ts
   declare module 'venn.js' {
    export interface VennSet {
      sets: string[];
      size: number;
    }

    export function VennDiagram(): {
      width: (width: number) => this;
      height: (height: number) => this;
      // Add other methods as needed
    };
  }