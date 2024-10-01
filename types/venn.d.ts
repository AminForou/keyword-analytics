declare module 'venn.js' {
    export interface VennDiagram {
        (): {
            width: (width: number) => this;
            height: (height: number) => this;
            // Add other methods as needed
        };
    }

    export interface VennSet {
        sets: string[];
        size: number;
    }

    const VennDiagram: VennDiagram;
    export default VennDiagram;
}
