"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  impressions: number;
  engagement: number;
  clicks: number;
  reach?: number;
  conversions?: number;
  value: number;
  [key: string]: string | number | undefined;
}

interface PerformanceTrendChartProps {
  data: ChartDataPoint[];
  timeRange: string;
  loading?: boolean;
}

type MetricType = 'impressions' | 'engagement' | 'clicks' | 'reach' | 'conversions';

interface MetricConfig {
  key: MetricType;
  label: string;
  color: string;
}

const METRICS: MetricConfig[] = [
  { key: 'impressions', label: 'Impressions', color: '#00A9EE' },
  { key: 'engagement', label: 'Engagement', color: '#10B981' },
  { key: 'clicks', label: 'Clicks', color: '#F59E0B' },
  { key: 'reach', label: 'Reach', color: '#8B5CF6' },
  { key: 'conversions', label: 'Conversions', color: '#EF4444' },
];

export function PerformanceTrendChart({ data, timeRange, loading = false }: PerformanceTrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('impressions');

  const getTimePeriodText = () => {
    switch (timeRange) {
      case 'today':
        return 'today';
      case '7d':
        return 'the last 7 days';
      case '30d':
        return 'the last 30 days';
      case '90d':
        return 'the last 90 days';
      default:
        return 'the selected period';
    }
  };

  const formatValue = (value: number) => {
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {payload[0].payload.date}
          </p>
          <div className="space-y-1">
            {METRICS.map((metric) => {
              const value = payload[0].payload[metric.key];
              if (value !== undefined && value !== null) {
                return (
                  <div key={metric.key} className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {metric.label}:
                    </span>
                    <span className="text-xs font-semibold" style={{ color: metric.color }}>
                      {formatValue(value)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const selectedMetricConfig = METRICS.find(m => m.key === selectedMetric) || METRICS[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Daily metrics over {getTimePeriodText()}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {METRICS.map((metric) => (
              <Button
                key={metric.key}
                size="sm"
                variant={selectedMetric === metric.key ? 'default' : 'outline'}
                onClick={() => setSelectedMetric(metric.key)}
                className="text-xs"
                style={
                  selectedMetric === metric.key
                    ? { backgroundColor: metric.color, borderColor: metric.color }
                    : undefined
                }
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : data.length === 0 || data.every(d => d[selectedMetric] === 0) ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No data available for {getTimePeriodText()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect your platforms to start seeing trends
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={selectedMetricConfig.color}
                strokeWidth={2}
                dot={{ fill: selectedMetricConfig.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: selectedMetricConfig.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

