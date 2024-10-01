declare module 'venn.js' {
    interface VennDiagram {
      width(value: number): VennDiagram;
      height(value: number): VennDiagram;
      // Add other methods as needed
    }
  
    function VennDiagram(): VennDiagram;
  
    const venn: {
      VennDiagram: typeof VennDiagram;
    };
  
    export default venn;
  }
  