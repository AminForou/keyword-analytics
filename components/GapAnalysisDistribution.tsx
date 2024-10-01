import React, { useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

const COLORS = {
  Gap: '#EF4444',
  Opportunity: '#10B981',
  Competitive: '#3B82F6',
  Neutral: '#6B7280'
};

const STATUS_LABELS = {
  Gap: 'Content Gap',
  Opportunity: 'Opportunity',
  Competitive: 'Competitive',
  Neutral: 'Neutral'
};

export default function GapAnalysisDistribution({ gapMatrix }: { gapMatrix: Array<{ gapStatus: string }> }) {
  const gapStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      Gap: 0,
      Opportunity: 0,
      Competitive: 0,
      Neutral: 0
    };
    gapMatrix.forEach(item => {
      counts[item.gapStatus]++;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
      size: value,
      status: key
    }));
  }, [gapMatrix]);

  const totalKeywords = gapMatrix.length;

  const CustomizedContent = (props: {
    root: { value: number };
    depth: number;
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    name: string;
    value: number;
  }) => {
    const { root, depth, x, y, width, height, index, name, value } = props;
    const percentage = ((value / root.value) * 100).toFixed(1);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[gapStatusData[index].status as keyof typeof COLORS],
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width > 40 && height > 25 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            dominantBaseline="middle"
          >
            {name}
            <tspan x={x + width / 2} y={y + height / 2 + 16} fontSize={10}>
              {percentage}%
            </tspan>
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Gap Status Distribution</h3>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-2/3 h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={gapStatusData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent 
                  root={{ value: gapMatrix.length }}
                  depth={0}
                  x={0}
                  y={0}
                  width={100}
                  height={100}
                  index={0}
                  name="Root"
                  value={gapMatrix.length}
                />}
              >
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 shadow rounded">
                          <p className="font-bold">{data.name}</p>
                          <p>Count: {data.size}</p>
                          <p>Percentage: {((data.size / totalKeywords) * 100).toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/3 mt-6 md:mt-0 md:ml-6 space-y-4">
            {gapStatusData.map((status) => (
              <div key={status.status} className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS[status.status as keyof typeof COLORS] }}></div>
                <span className="text-sm font-medium text-gray-700">{status.name}:</span>
                <span className="ml-2 text-sm text-gray-900">{status.size}</span>
                <span className="ml-1 text-sm text-gray-500">
                  ({((status.size / totalKeywords) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
            <div className="text-sm font-medium text-gray-700 mt-4">
              Total Keywords: {totalKeywords}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
