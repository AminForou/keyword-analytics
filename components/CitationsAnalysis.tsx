import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { initialKeywords } from "./data/initialKeywords";
import { Input } from "../components/ui/input";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";

type Citation = {
  id: number;
  url: string;
};

type KeywordWithCitations = {
  keyword: string;
  citations: Citation[];
};

const MAIN_BRAND_DOMAINS = [
  "www.gap.com",
  "oldnavy.gap.com",
  "bananarepublic.gap.com"
];

const MAIN_BRAND_NAME = "Gap Inc.";
const BASE_COLOR = "#8884d8";
const ROWS_PER_PAGE = 10;

type SortKey = "keyword" | "citationCount" | "brandCitation";
type SortOrder = "asc" | "desc";

export default function CitationsAnalysis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("keyword");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [brandCitationFilter, setBrandCitationFilter] = useState("all");

  const citationData = useMemo(() => {
    const keywordsWithCitations = initialKeywords.filter(
      (k) => k.citations && k.citations.length > 0
    ) as KeywordWithCitations[];
    const allCitations = keywordsWithCitations.flatMap((k) => k.citations);
    const citationCounts = allCitations.reduce((acc, citation) => {
      const domain = new URL(citation.url).hostname;
      const normalizedDomain = MAIN_BRAND_DOMAINS.includes(domain) ? MAIN_BRAND_NAME : domain;
      acc[normalizedDomain] = (acc[normalizedDomain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedCitations = Object.entries(citationCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([domain, count]) => ({ domain, count }));

    const brandCitations = keywordsWithCitations.filter(k => 
      k.citations.some(citation => 
        MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
      )
    ).length;

    return {
      totalCitations: allCitations.length,
      uniqueSources: Object.keys(citationCounts).length,
      topSources: sortedCitations,
      keywordsWithCitations,
      averageCitationsPerKeyword: allCitations.length / keywordsWithCitations.length,
      brandCitations,
    };
  }, []);

  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = citationData.keywordsWithCitations.filter((k) =>
      k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (brandCitationFilter !== "all") {
      filtered = filtered.filter((k) => {
        const hasBrandCitation = k.citations.some(citation => 
          MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
        );
        return brandCitationFilter === "with" ? hasBrandCitation : !hasBrandCitation;
      });
    }

    return filtered.sort((a, b) => {
      if (sortKey === "keyword") {
        return sortOrder === "asc" ? a.keyword.localeCompare(b.keyword) : b.keyword.localeCompare(a.keyword);
      } else if (sortKey === "citationCount") {
        return sortOrder === "asc" ? a.citations.length - b.citations.length : b.citations.length - a.citations.length;
      } else if (sortKey === "brandCitation") {
        const aHasBrandCitation = a.citations.some(citation => 
          MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
        );
        const bHasBrandCitation = b.citations.some(citation => 
          MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
        );
        return sortOrder === "asc" ? (aHasBrandCitation ? 1 : -1) : (bHasBrandCitation ? 1 : -1);
      }
      return 0;
    });
  }, [citationData.keywordsWithCitations, searchTerm, sortKey, sortOrder, brandCitationFilter]);

  const paginatedKeywords = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredAndSortedKeywords.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredAndSortedKeywords, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedKeywords.length / ROWS_PER_PAGE);

  const citationShare = (citationData.brandCitations / citationData.totalCitations * 100).toFixed(2);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortOrder === "asc" ? <ChevronUp className="inline-block ml-1" size={16} /> : <ChevronDown className="inline-block ml-1" size={16} />;
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-gray-800">Citations Analysis</CardTitle>
        <div className="text-sm text-gray-500">
          {MAIN_BRAND_NAME} includes: {MAIN_BRAND_DOMAINS.map(d => d.replace('www.', '')).join(", ")}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Citations" value={citationData.totalCitations} />
          <StatCard title="Unique Sources" value={citationData.uniqueSources} />
          <StatCard
            title="Avg Citations per Keyword"
            value={citationData.averageCitationsPerKeyword.toFixed(2)}
          />
          <StatCard title="Brand Citations" value={citationData.brandCitations} />
          <StatCard title="Citation Share" value={`${citationShare}%`} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">Top Cited Sources</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={citationData.topSources.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis
                  dataKey="domain"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count">
                  {citationData.topSources.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BASE_COLOR} 
                      fillOpacity={1 - (index * 0.03)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Citations per Keyword</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex space-x-4">
              <div className="relative flex-grow">
                <Input
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search Keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <Select
                value={brandCitationFilter}
                onChange={(e) => setBrandCitationFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">All Citations</option>
                <option value="with">With Brand Citation</option>
                <option value="without">Without Brand Citation</option>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3 cursor-pointer" onClick={() => handleSort("keyword")}>
                      Keyword <SortIcon column="keyword" />
                    </TableHead>
                    <TableHead className="w-1/6 cursor-pointer" onClick={() => handleSort("citationCount")}>
                      Citation Count <SortIcon column="citationCount" />
                    </TableHead>
                    <TableHead className="w-1/6 cursor-pointer" onClick={() => handleSort("brandCitation")}>
                      Brand Citation <SortIcon column="brandCitation" />
                    </TableHead>
                    <TableHead>Citations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedKeywords.map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell>{keyword.citations.length}</TableCell>
                      <TableCell>
                        {keyword.citations.some(citation => 
                          MAIN_BRAND_DOMAINS.includes(new URL(citation.url).hostname)
                        ) ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Yes</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc pl-5">
                          {keyword.citations.map((citation, citIndex) => (
                            <li key={citIndex}>
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {new URL(citation.url).hostname.replace('www.', '')}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * ROWS_PER_PAGE + 1} to {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedKeywords.length)} of {filteredAndSortedKeywords.length} results
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-1 text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </CardContent>
    </Card>
  );
}