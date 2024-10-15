import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "./ui/button";
import { Check, X, ArrowUpDown } from "lucide-react";
import { Pagination } from "./ui/pagination";

// Define the type inline
type GapMatrixItem = {
  keyword: string;
  intent: string;
  impressions: number;
  clicks: number;
  mentions: Array<{ name: string; mentioned: boolean }>;
  gapStatus: string;
  // Add any other properties that your gapMatrix items have
};

export default function GapAnalysisTopTable({ 
  gapMatrix, 
  gapFilter, 
  allBrands,
  mainBrand
}: {
  gapMatrix: GapMatrixItem[];
  gapFilter: string | null;
  allBrands: string[];
  mainBrand: string;
}) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: '', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 15;

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...gapMatrix];
    if (gapFilter) {
      sortableItems = sortableItems.filter(item => item.gapStatus === gapFilter);
    }
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof GapMatrixItem];
        const bValue = b[sortConfig.key as keyof GapMatrixItem];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [gapMatrix, sortConfig, gapFilter]);

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">
              <Button variant="ghost" onClick={() => requestSort('keyword')}>
                Keyword <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('intent')}>
                Intent <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('impressions')}>
                Impressions <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('clicks')}>
                Clicks <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>{mainBrand}</TableHead>
            {allBrands.filter(brand => brand !== mainBrand).map(brand => (
              <TableHead key={brand}>{brand}</TableHead>
            ))}
            <TableHead>Gap Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, index) => (
            <TableRow
              key={index}
              className={
                row.gapStatus === "Gap" ? "bg-red-50"
                : row.gapStatus === "Opportunity" ? "bg-green-50"
                : row.gapStatus === "Competitive" ? "bg-blue-50"
                : ""
              }
            >
              <TableCell className="font-medium">{row.keyword}</TableCell>
              <TableCell>{row.intent}</TableCell>
              <TableCell>{row.impressions.toLocaleString()}</TableCell>
              <TableCell>{row.clicks.toLocaleString()}</TableCell>
              <TableCell>
                {row.mentions.find(m => m.name === mainBrand)?.mentioned ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </TableCell>
              {allBrands.filter(brand => brand !== mainBrand).map(brand => (
                <TableCell key={brand}>
                  {row.mentions.find(m => m.name === brand)?.mentioned ? (
                    <Check className="text-green-500" />
                  ) : (
                    <X className="text-red-500" />
                  )}
                </TableCell>
              ))}
              <TableCell>
                <span
                  className={`px-2 py-1 rounded ${
                    row.gapStatus === "Gap" ? "bg-red-200 text-red-800"
                    : row.gapStatus === "Opportunity" ? "bg-green-200 text-green-800"
                    : row.gapStatus === "Competitive" ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {row.gapStatus}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pageCount > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
