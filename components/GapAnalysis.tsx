import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/Select";
import { initialKeywords } from './data/initialKeywords';
import { initialCompetitors } from './data/initialCompetitors';
import GapAnalysisTopTable from './GapAnalysisTopTable';
import GapAnalysisDistribution from './GapAnalysisDistribution';
import GapAnalysisVenn from './GapAnalysisVenn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { InfoIcon } from "lucide-react";
export default function GapAnalysis() {
  const [keywords] = useState(initialKeywords);
  const [competitors] = useState(initialCompetitors);
  const [searchTerm, setSearchTerm] = useState("");
  const [mainBrand, setMainBrand] = useState("Nike");
  const [gapFilter, setGapFilter] = useState("");

  const allBrands = useMemo(() => {
    return [mainBrand, ...competitors.map(c => c.names[0]).filter(name => name !== mainBrand)];
  }, [mainBrand, competitors]);

  const fullGapMatrix = useMemo(() => {
    return keywords.map(keyword => {
      const brandMentions = keyword.chatGPT.toLowerCase();
      const mainBrandMentioned = brandMentions.includes(mainBrand.toLowerCase());

      const competitorsMentioned = allBrands.map(brand => ({
        name: brand,
        mentioned: brandMentions.includes(brand.toLowerCase())
      }));

      const anyCompetitorMentioned = competitorsMentioned.some(c => c.mentioned && c.name !== mainBrand);

      let gapStatus = "";
      if (mainBrandMentioned && anyCompetitorMentioned) {
        gapStatus = "Competitive";
      } else if (mainBrandMentioned && !anyCompetitorMentioned) {
        gapStatus = "Opportunity";
      } else if (!mainBrandMentioned && anyCompetitorMentioned) {
        gapStatus = "Gap";
      } else {
        gapStatus = "Neutral";
      }

      return {
        keyword: keyword.keyword,
        intent: keyword.intent,
        impressions: keyword.impressions,
        clicks: keyword.clicks,
        mentions: competitorsMentioned,
        gapStatus: gapStatus
      };
    });
  }, [keywords, allBrands, mainBrand]);

  const filteredGapMatrix = useMemo(() => {
    return fullGapMatrix
      .filter(item => item.keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => !gapFilter || item.gapStatus === gapFilter);
  }, [fullGapMatrix, searchTerm, gapFilter]);

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
        <CardTitle className="text-2xl font-bold text-gray-800">Gap Analysis</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Select
            label="Main Brand"
            value={mainBrand}
            onChange={(e) => setMainBrand(e.target.value)}
          >
            <option value="Nike">Nike</option>
            {competitors.map(c => (
              <option key={c.id} value={c.names[0]}>{c.names[0]}</option>
            ))}
          </Select>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">Gap Status</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-500 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md p-4 bg-white shadow-lg rounded-lg border border-gray-200">
                    <h3 className="font-bold mb-2 text-gray-800">Gap Status Explanation:</h3>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-gray-600">
                      <li><span className="font-semibold text-gray-700">Gap:</span> Your brand is not mentioned, but competitors are.</li>
                      <li><span className="font-semibold text-gray-700">Opportunity:</span> Your brand is mentioned, but competitors are not.</li>
                      <li><span className="font-semibold text-gray-700">Competitive:</span> Both your brand and competitors are mentioned.</li>
                      <li><span className="font-semibold text-gray-700">Neutral:</span> Neither your brand nor competitors are mentioned.</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={gapFilter}
              onChange={(e) => setGapFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Gap">Gap</option>
              <option value="Opportunity">Opportunity</option>
              <option value="Competitive">Competitive</option>
              <option value="Neutral">Neutral</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="keyword-search" className="block text-sm font-medium text-gray-700">Search Keywords</label>
            <Input
              id="keyword-search"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <GapAnalysisTopTable 
          gapMatrix={filteredGapMatrix} 
          gapFilter={gapFilter} 
          allBrands={allBrands}
          mainBrand={mainBrand}
        />
        <GapAnalysisDistribution gapMatrix={filteredGapMatrix} />
        <GapAnalysisVenn 
          gapMatrix={fullGapMatrix}  // Use the full dataset here
          competitors={competitors}
        />
      </CardContent>
    </Card>
  );
}
