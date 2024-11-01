import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from 'd3';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";

// Import types from the custom declaration
import { VennSet, } from 'venn.js';

// Add constants at the top of the file
const MAIN_BRAND_ALIASES = ["Gap", "Old Navy", "Banana Republic"];
const MAIN_BRAND_DOMAINS = [
  "www.gap.com",
  "oldnavy.gap.com",
  "bananarepublic.gap.com"
];

interface GapMatrixItem {
  mentions: { name: string; mentioned: boolean }[];
  keyword: string;
  citations?: { id: number; url: string }[]; // Add citations to the interface
}

interface Competitor {
  names: string[];
  color: string;
}

export default function GapAnalysisVenn({ gapMatrix, competitors }: { gapMatrix: GapMatrixItem[], competitors: Competitor[] }) {
  const [activeBrands, setActiveBrands] = useState<string[]>(['Gap Inc.', ...competitors.map(c => c.names[0])]);
  const [allBrands] = useState<string[]>(['Gap Inc.', ...competitors.map(c => c.names[0])]);
  const [selectedIntersection, setSelectedIntersection] = useState<string[] | null>(null);

  // Removed the vennDiagram state variable
  const vennRef = useRef<HTMLDivElement | null>(null);
  const [mainBrand, setMainBrand] = useState<string>('Gap');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const toggleBrand = (brand: string) => {
    setActiveBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
    setSelectedIntersection(null);
  };

  const vennData = useMemo(() => {
    const sets: VennSet[] = activeBrands.map(brand => ({
      sets: [brand],
      size: gapMatrix.filter(row => {
        if (brand === 'Gap Inc.') {
          const hasChatGPTMention = MAIN_BRAND_ALIASES.some(alias => 
            row.mentions.find(m => m.name === alias)?.mentioned
          );
          const hasCitation = row.citations?.some(citation => 
            MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
          );
          return hasChatGPTMention || hasCitation;
        }
        return row.mentions.find(m => m.name === brand)?.mentioned;
      }).length
    }));

    // Calculate intersections
    activeBrands.forEach((brand1, i) => {
      activeBrands.slice(i + 1).forEach(brand2 => {
        const intersection = gapMatrix.filter(row => {
          const brand1Mentioned = brand1 === 'Gap Inc.'
            ? (MAIN_BRAND_ALIASES.some(alias => 
                row.mentions.find(m => m.name === alias)?.mentioned
              ) ||
              row.citations?.some(citation => 
                MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
              ))
            : row.mentions.find(m => m.name === brand1)?.mentioned;

          const brand2Mentioned = brand2 === 'Gap Inc.'
            ? (MAIN_BRAND_ALIASES.some(alias => 
                row.mentions.find(m => m.name === alias)?.mentioned
              ) ||
              row.citations?.some(citation => 
                MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
              ))
            : row.mentions.find(m => m.name === brand2)?.mentioned;

          return brand1Mentioned && brand2Mentioned;
        }).length;

        if (intersection > 0) {
          sets.push({ sets: [brand1, brand2], size: intersection });
        }
      });
    });

    return sets;
  }, [activeBrands, gapMatrix]);

  const intersectionData = useMemo(() => {
    if (!selectedIntersection || selectedIntersection.length === 0) {
      return gapMatrix;
    }
    return gapMatrix.filter(row => 
      selectedIntersection.every(brand => 
        row.mentions.find(m => m.name === brand)?.mentioned
      )
    );
  }, [selectedIntersection, gapMatrix]);

  const individualVennData = useMemo(() => {
    return allBrands
      .filter(brand => brand !== mainBrand)
      .map(brand => ({
        brand,
        data: [
          { sets: [mainBrand], size: gapMatrix.filter(row => row.mentions.find(m => m.name === mainBrand)?.mentioned).length },
          { sets: [brand], size: gapMatrix.filter(row => row.mentions.find(m => m.name === brand)?.mentioned).length },
          { sets: [mainBrand, brand], size: gapMatrix.filter(row => 
            row.mentions.find(m => m.name === mainBrand)?.mentioned &&
            row.mentions.find(m => m.name === brand)?.mentioned
          ).length }
        ]
      }));
  }, [mainBrand, allBrands, gapMatrix]);

  useEffect(() => {
    const loadAndRenderVenn = async () => {
      if (typeof window !== 'undefined' && vennRef.current) {
        // Set d3 globally
        (window as Window & typeof globalThis & { d3: typeof d3 }).d3 = d3;
        try {
          // Dynamically import venn.js
          const vennModule = await import('venn.js');
          const VennDiagram = vennModule.VennDiagram;
  
          // Remove existing content
          d3.select(vennRef.current).selectAll("*").remove();
  
          // Create and configure the Venn diagram
          const chart: vennModule.VennDiagram = VennDiagram()
            .width(600)
            .height(400);
  
          // Draw the Venn diagram
          const div = d3.select(vennRef.current).datum(vennData).call(chart);
  
          const svg = div.select('svg');
          svg.attr('width', '100%')
            .attr('height', '100%')
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('viewBox', '0 0 600 400');
  
          div.selectAll("path")
            .style("stroke-opacity", 0)
            .style("stroke", "#fff")
            .style("stroke-width", 3);
  
          div.selectAll("g")
            .on("mouseover", function () {
              const selection = d3.select(this);
              selection.select("path")
                .style("fill-opacity", .2)
                .style("stroke-opacity", 1);
            })
            .on("mouseout", function () {
              const selection = d3.select(this);
              selection.select("path")
                .style("fill-opacity", 0.1)
                .style("stroke-opacity", 0);
            })
            .on("click", function (event, d: VennSet) {
              setSelectedIntersection(d.sets);
            });
  
          console.log('Venn diagram module loaded and rendered successfully');
        } catch (error) {
          console.error('Error initializing venn.js module:', error);
        }
      } else {
        console.error('venn.js module is not properly loaded or vennRef.current is null');
      }
    };
    loadAndRenderVenn();
  }, [vennData]);
  

  useEffect(() => {
    const loadAndRenderIndividualVenn = async () => {
      if (isAccordionOpen) {
        // Set d3 globally
        (window as Window & typeof globalThis & { d3: typeof d3 }).d3 = d3;

        try {
          const vennModule = await import('venn.js');
          const VennDiagram = vennModule.default || vennModule.VennDiagram;

          individualVennData.forEach(({ brand, data }) => {
            const vennElement = document.getElementById(`venn-${brand}`);
            if (vennElement) {
              d3.select(vennElement).selectAll("*").remove();
              const chart = VennDiagram()
                .width(200)
                .height(150);

              const diagram = d3.select(vennElement).datum(data).call(chart);

              diagram.selectAll(".venn-circle path")
                .style("fill-opacity", .2)
                .style("stroke-width", 0);

              diagram.selectAll(".venn-circle text")
                .style("font-size", "10px")
                .style("font-weight", "bold");
            }
          });
        } catch (error) {
          console.error('Error rendering individual Venn diagrams:', error);
        }
      }
    };
    loadAndRenderIndividualVenn();
  }, [isAccordionOpen, individualVennData]);

  const renderIndividualVennDiagrams = () => {
    return individualVennData.map(({ brand }) => (
      <div key={brand} className="border p-2 rounded-lg">
        <h4 className="text-sm font-semibold mb-1">{mainBrand} vs {brand}</h4>
        <div id={`venn-${brand}`} style={{ width: '200px', height: '150px' }}></div>
      </div>
    ));
  };

  return (
    <>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Brand Mention Count</h3>
        <div className="flex flex-wrap gap-4">
          {allBrands.map(brand => {
            const brandData = vennData.find(d => d.sets[0] === brand);
            const isActive = activeBrands.includes(brand);
            return (
              <Button
                key={brand}
                variant={isActive ? "default" : "outline"}
                onClick={() => toggleBrand(brand)}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{backgroundColor: brand === 'Gap' ? '#000000' : competitors.find(c => c.names[0] === brand)?.color || '#CCCCCC'}}
                />
                <span>{brand}: {brandData ? brandData.size : 0}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Brand Intersection Analysis</h3>
        <div className="flex justify-center items-center">
          <div ref={vennRef} style={{ width: '100%', maxWidth: '600px', height: '400px' }}></div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Individual Brand Comparisons</h3>
        <div className="mb-4">
          <label htmlFor="mainBrand" className="mr-2">Main Brand:</label>
          <select
            id="mainBrand"
            value={mainBrand}
            onChange={(e) => setMainBrand(e.target.value)}
            className="border rounded p-1"
          >
            {allBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-4 text-left bg-gray-100"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          >
            <span className="text-lg font-semibold">1x1 Brand Comparisons</span>
            {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
          {isAccordionOpen && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {renderIndividualVennDiagrams()}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
          {selectedIntersection && selectedIntersection.length > 0
            ? `Intersection Details: ${selectedIntersection.join(' ∩ ')}`
            : 'All Keywords'}
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              {activeBrands.map(brand => (
                <TableHead key={brand}>{brand}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {intersectionData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.keyword}</TableCell>
                {activeBrands.map(brand => (
                  <TableCell key={brand}>
                    {row.mentions.find(m => m.name === brand)?.mentioned ? (
                      <Check className="text-green-500" />
                    ) : (
                      <X className="text-red-500" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}