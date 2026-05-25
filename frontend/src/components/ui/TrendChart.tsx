import React, { useMemo } from 'react';
import { Loader } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface TrendDataPoint {
  month: string;
  value: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, loading = false }) => {
  const [tooltipData, setTooltipData] = React.useState<TrendDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const chartWidth = 600;
  const chartHeight = 240;
  const padding = parseInt(tokens.spacing.md, 10);
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const { maxValue, minValue, points, areaPath, linePath } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxValue: 0, minValue: 0, points: [], areaPath: '', linePath: '' };
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const pts = data.map((d, i) => ({
      x: padding + (i / (data.length - 1 || 1)) * innerWidth,
      y: padding + innerHeight - ((d.value - min) / range) * innerHeight,
      data: d,
    }));

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area =
      line +
      ` L ${pts[pts.length - 1].x} ${padding + innerHeight}` +
      ` L ${pts[0].x} ${padding + innerHeight} Z`;

    return { maxValue: max, minValue: min, points: pts, areaPath: area, linePath: line };
  }, [data, innerWidth, innerHeight, padding]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!data || data.length === 0) return;

    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;

    const closestPoint = points.reduce((prev, curr) =>
      Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
    );

    setTooltipData(closestPoint.data);
    setTooltipPosition({ x: closestPoint.x, y: closestPoint.y });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '240px',
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    padding: tokens.spacing.md,
    transition: 'box-shadow 300ms ease',
  };

  const svgStyle: React.CSSProperties = {
    width: '100%',
    height: '240px',
    overflow: 'visible',
  };

  const axisLabelStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.small.size,
    fontWeight: parseInt(tokens.typography.small.weight as unknown as string, 10),
    fill: tokens.colors.textSecondary,
  };

  const spinnerOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: tokens.radii.lg,
    animation: 'fadeIn 200ms ease',
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: tooltipPosition.x + 10,
    top: tooltipPosition.y - 40,
    backgroundColor: tokens.colors.darkSurface,
    color: tokens.colors.darkTextPrimary,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderRadius: tokens.radii.md,
    fontSize: tokens.typography.small.size,
    fontFamily: tokens.typography.fontFamily,
    pointerEvents: 'none',
    opacity: tooltipData ? 1 : 0,
    transition: 'opacity 200ms ease',
    zIndex: 10,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={containerStyle}>
      <svg
        style={svgStyle}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tokens.colors.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={tokens.colors.accent} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + innerHeight}
          stroke={tokens.colors.border}
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding + innerHeight}
          x2={padding + innerWidth}
          y2={padding + innerHeight}
          stroke={tokens.colors.border}
          strokeWidth="1"
        />

        {maxValue !== minValue && (
          <>
            <text x={padding - 8} y={padding + 4} textAnchor="end" style={axisLabelStyle}>
              {maxValue}
            </text>
            <text
              x={padding - 8}
              y={padding + innerHeight + 4}
              textAnchor="end"
              style={axisLabelStyle}
            >
              {minValue}
            </text>
          </>
        )}

        {points.map((point, i) => (
          <text
            key={`label-${i}`}
            x={point.x}
            y={padding + innerHeight + 16}
            textAnchor="middle"
            style={axisLabelStyle}
          >
            {point.data.month}
          </text>
        ))}

        {areaPath && (
          <path d={areaPath} fill="url(#areaGradient)" />
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={tokens.chart.trendChartStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={tokens.colors.surface}
            stroke={tokens.chart.trendChartStroke}
            strokeWidth="2"
          />
        ))}
      </svg>

      <div style={tooltipStyle}>
        {tooltipData && (
          <>
            <div style={{ fontWeight: 600 }}>{tooltipData.month}</div>
            <div>{tooltipData.value}</div>
          </>
        )}
      </div>

      {loading && (
        <div style={spinnerOverlayStyle}>
          <Loader
            size={32}
            color={tokens.colors.accent}
            style={{ animation: 'spin 1s linear infinite' }}
          />
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default TrendChart;