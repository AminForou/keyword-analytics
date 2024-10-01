"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Function to generate data for the last 14 days of the current month
const generateData = (competitors: Competitor[]) => {
  const data = []
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDay = Math.max(1, lastDayOfMonth - 13)

  for (let day = startDay; day <= lastDayOfMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dataPoint: any = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    competitors.forEach(competitor => {
      dataPoint[competitor.name] = +(Math.random() * 5).toFixed(2)
    })
    data.push(dataPoint)
  }

  return data
}

interface Competitor {
  name: string;
  color: string;
}

interface VisibilityDashboardProps {
  competitors: Competitor[];
  visibleCompetitors: string[];
  onVisibleCompetitorsChange: (visibleCompetitors: string[]) => void;
}

export default function VisibilityDashboard({ 
  competitors, 
  visibleCompetitors, 
  onVisibleCompetitorsChange 
}: VisibilityDashboardProps) {
  const [randomValues, setRandomValues] = useState<Record<string, string>>({})
  const [data, setData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart')

  useEffect(() => {
    if (competitors) {
      // Only set initial visible competitors if the array is empty
      if (visibleCompetitors.length === 0) {
        onVisibleCompetitorsChange(competitors.map(competitor => competitor.name));
      }
      setData(generateData(competitors))
      const newRandomValues = competitors.reduce((acc, competitor) => {
        acc[competitor.name] = (Math.random() * 0.3).toFixed(2)
        return acc
      }, {} as Record<string, string>)
      setRandomValues(newRandomValues)
    }
  }, [competitors, visibleCompetitors, onVisibleCompetitorsChange]);

  const toggleCompetitor = (competitorName: string) => {
    onVisibleCompetitorsChange(
      visibleCompetitors.includes(competitorName)
        ? visibleCompetitors.filter(name => name !== competitorName)
        : [...visibleCompetitors, competitorName]
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          {competitors.map(competitor => (
            <Card key={competitor.name} className="p-2 hover:shadow-md transition-shadow">
              <div className="text-sm font-semibold truncate" title={competitor.name}>
                {competitor.name}
              </div>
              <div className="text-2xl font-bold">
                {(data[data.length - 1]?.[competitor.name] || 0).toFixed(2)}%
              </div>
              <div className="text-xs text-red-500">
                -{randomValues[competitor.name] || '0.00'}
              </div>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {competitors.map(competitor => (
            <Button
              key={competitor.name}
              variant="outline"
              size="sm"
              className={`px-2 py-1 rounded-full transition-all ${
                visibleCompetitors.includes(competitor.name)
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
              style={{ 
                backgroundColor: visibleCompetitors.includes(competitor.name) ? competitor.color : 'transparent',
                color: visibleCompetitors.includes(competitor.name) ? 'white' : competitor.color,
                borderColor: competitor.color
              }}
              onClick={() => toggleCompetitor(competitor.name)}
            >
              {competitor.name}
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
                  {competitors.map(competitor => (
                    visibleCompetitors.includes(competitor.name) && (
                      <Line
                        key={competitor.name}
                        type="monotone"
                        dataKey={competitor.name}
                        stroke={competitor.color}
                        strokeWidth={2}
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
                    {visibleCompetitors.map(competitor => (
                      <th key={competitor} className="text-left p-2" style={{ color: competitors.find(c => c.name === competitor)?.color }}>
                        {competitor}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2">{row.date}</td>
                      {visibleCompetitors.map(competitor => (
                        <td key={competitor} className="p-2">
                          {row[competitor]?.toFixed(2)}%
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