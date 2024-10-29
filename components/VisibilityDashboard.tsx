"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Add this interface near the top of your file, after the other interfaces
interface DataPoint {
  date: string;
  [key: string]: string | number; // This allows for dynamic competitor names as keys
}

const MAIN_BRAND_ALIASES = ["Gap", "Old Navy", "Banana Republic"];

// Function to generate data for the last 14 days of the current month
const generateData = (competitors: Competitor[]) => {
  const data: DataPoint[] = []
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDay = Math.max(1, lastDayOfMonth - 13)

  for (let day = startDay; day <= lastDayOfMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dataPoint: DataPoint = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    // Generate combined value for main brand
    const mainBrandValue = +(Math.random() * 5).toFixed(2);
    dataPoint["Gap Inc."] = mainBrandValue;

    // Generate values for other competitors
    competitors
      .filter(comp => !MAIN_BRAND_ALIASES.includes(comp.name))
      .forEach(competitor => {
        dataPoint[competitor.name] = +(Math.random() * 5).toFixed(2)
      });

    data.push(dataPoint)
  }

  return data
}

interface Competitor {
  name: string;
  color: string;
  isMainBrand?: boolean;
}

interface VisibilityDashboardProps {
  mainBrand: Competitor;
  competitors: Competitor[];
  visibleCompetitors: string[];
  onVisibleCompetitorsChange: (visibleCompetitors: string[]) => void;
}

export default function VisibilityDashboard({ 
  mainBrand,
  competitors = [], 
  visibleCompetitors = [], 
  onVisibleCompetitorsChange 
}: VisibilityDashboardProps) {
  const [randomValues, setRandomValues] = useState<Record<string, string>>({})
  const [data, setData] = useState<DataPoint[]>([])
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart')

  const allBrands = useMemo(() => {
    const mainBrandEntity = {
      name: "Gap Inc.",
      color: "#000000",
      isMainBrand: true,
      aliases: MAIN_BRAND_ALIASES
    };

    const otherCompetitors = competitors.filter(
      comp => !MAIN_BRAND_ALIASES.includes(comp.name)
    );

    return [mainBrandEntity, ...otherCompetitors];
  }, [competitors]);

  useEffect(() => {
    if (allBrands.length > 0) {
      // Only set initial visible competitors if the array is empty
      if (visibleCompetitors.length === 0) {
        onVisibleCompetitorsChange(allBrands.map(brand => brand.name));
      }
      setData(generateData(allBrands))
      const newRandomValues = allBrands.reduce((acc, brand) => {
        acc[brand.name] = (Math.random() * 0.3).toFixed(2)
        return acc
      }, {} as Record<string, string>)
      setRandomValues(newRandomValues)
    }
  }, [allBrands, visibleCompetitors, onVisibleCompetitorsChange]);

  const toggleBrand = (brandName: string) => {
    onVisibleCompetitorsChange(
      visibleCompetitors.includes(brandName)
        ? visibleCompetitors.filter(name => name !== brandName)
        : [...visibleCompetitors, brandName]
    );
  }

  if (!competitors || competitors.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Visibility Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No competitors data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Visibility Dashboard</CardTitle>
        <div className="text-sm text-gray-500">
          Gap Inc. includes: {MAIN_BRAND_ALIASES.join(", ")}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          {allBrands.map(brand => (
            <Card key={brand.name} className="p-2 hover:shadow-md transition-shadow">
              <div className="text-sm font-semibold truncate" title={brand.name}>
                {brand.name} {brand.isMainBrand && "(Main)"}
              </div>
              <div className="text-2xl font-bold">
                {(data[data.length - 1]?.[brand.name] || 0).toFixed(2)}%
              </div>
              <div className="text-xs text-red-500">
                -{randomValues[brand.name] || '0.00'}
              </div>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {allBrands.map(brand => (
            <Button
              key={brand.name}
              variant="outline"
              size="sm"
              className={`px-2 py-1 rounded-full transition-all ${
                visibleCompetitors.includes(brand.name)
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
              style={{ 
                backgroundColor: visibleCompetitors.includes(brand.name) ? brand.color : 'transparent',
                color: visibleCompetitors.includes(brand.name) ? 'white' : brand.color,
                borderColor: brand.color
              }}
              onClick={() => toggleBrand(brand.name)}
            >
              {brand.isMainBrand ? `${brand.name} (Main)` : brand.name}
            </Button>
          ))}
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chart' | 'table')}>
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  {allBrands.map(brand => (
                    visibleCompetitors.includes(brand.name) && (
                      <Line
                        key={brand.name}
                        type="monotone"
                        dataKey={brand.name}
                        stroke={brand.color}
                        strokeWidth={brand.isMainBrand ? 3 : 2}
                        dot={false}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    {visibleCompetitors.map(brandName => {
                      const brand = allBrands.find(b => b.name === brandName);
                      return (
                        <th key={brandName} className="text-left p-2" style={{ color: brand?.color }}>
                          {brand?.isMainBrand ? `${brandName} (Main)` : brandName}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2">{row.date}</td>
                      {visibleCompetitors.map(brandName => (
                        <td key={brandName} className="p-2">
                          {row[brandName]?.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
