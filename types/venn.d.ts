declare module 'venn.js' {  
    // The default export is a function that creates a Venn diagram instance
    export default function VennDiagram(): VennDiagramInstance;
  
    // Interface for the Venn diagram instance with available methods
    export interface VennDiagramInstance {
      width(width: number): VennDiagramInstance;
      height(height: number): VennDiagramInstance;
      // Add other methods if you use them
      // For example:
      // fontSize(size: string): VennDiagramInstance;
      // duration(duration: number): VennDiagramInstance;
    }
  
    // Interface for the data structure used by the Venn diagram
    export interface VennSet {
      sets: string[];
      size: number;
    }
  }