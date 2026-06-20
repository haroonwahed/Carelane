import { Card } from "./ui/card";
import { CHART_COLORS } from "../lib/chartColors";
import { Language, t, formatCurrency } from "../lib/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RevenueShareData {
  account: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface RevenueShareChartProps {
  data: RevenueShareData[];
  language: Language;
}

export function RevenueShareChart({ data, language }: RevenueShareChartProps) {
  const formatCurr = (value: number) => {
    return formatCurrency(value, language).replace(/,00/g, '').replace(/\.00/g, '');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="rounded-xl border bg-popover p-3"
          style={{
            boxShadow: CHART_COLORS.cardGlow,
          }}
        >
          <p
            className="text-foreground mb-1"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {data.account}
          </p>
          <p
            className="text-foreground"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            {formatCurr(data.revenue)} • {data.percentage.toFixed(1)}% {language === 'fr' ? 'du total' : 'of total'}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ x, y, width, value, index, ...props }: any) => {
    const chartData = data[index];
    if (!chartData) return null;
    
    return (
      <text
        x={x + width + 8}
        y={y + 10}
        fill={CHART_COLORS.axis}
        fontSize={12}
        fontWeight={500}
      >
        {chartData.percentage.toFixed(0)}% • {formatCurr(chartData.revenue)}
      </text>
    );
  };

  return (
    <Card
      className="rounded-2xl border p-6 bg-card shadow-sm"
      style={{
        boxShadow: CHART_COLORS.cardGlow,
      }}
    >
      <h3
        className="text-foreground mb-6"
        style={{ fontSize: "18px", fontWeight: 600 }}
      >
        {t(language, "kpi.revenueShare")}
      </h3>

      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)} minHeight={Math.max(200, data.length * 60)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 150, left: 5, bottom: 5 }}
        >
          <defs>
            {data.map((entry, index) => (
              <filter key={`glow-${index}`} id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke={CHART_COLORS.grid}
            strokeWidth={1}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke={CHART_COLORS.axis}
            tick={{ fontSize: 13, fill: CHART_COLORS.axis }}
            tickLine={{ stroke: CHART_COLORS.grid }}
            axisLine={{ stroke: CHART_COLORS.grid }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="account"
            stroke={CHART_COLORS.axis}
            tick={{ fontSize: 13, fill: CHART_COLORS.labelBold, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="percentage"
            radius={[0, 12, 12, 0]}
            label={<CustomLabel />}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                filter={`url(#glow-${index})`}
                style={{
                  filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}