import React, { useMemo } from 'react';
import { Loader } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface PlantChartDataPoint {
  plantId: string;
  plantName: string;
  value: number;
}

interface PlantChartProps {
  data: PlantChartDataPoint[];
  loading?: boolean;
}

const PlantChart: React.FC<PlantChartProps> = ({ data, loading = false }) => {
  const [tooltipData, setTooltipData] = React.useState<PlantChartDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const chartWidth = 600;
  const chartHeight = 240;
  const padding = parseInt(tokens.spacing.md, 10);
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const barColors = [
    tokens.colors.secondary,
    tokens.colors.accent,
    tokens.colors.primaryLight,
  ];

  const { maxValue, bars } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxValue: 0, bars: [] };
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);

    const barWidth = Math.min(60, (innerWidth / data.length) * 0.7);
    const barGap = (innerWidth - barWidth * data.length) / (data.length + 1);

    const barData = data.map((d, i) => {
      const barHeight = (d.value / max) * innerHeight;
      return {
        x: padding + barGap + i * (barWidth + barGap),
        y: padding + innerHeight - barHeight,
        width: barWidth,
        height: barHeight,
        data: d,
        color: barColors[i % barColors.length],
      };
    });

    return { maxValue: max, bars: barData };
  }, [data, innerWidth, innerHeight, padding]);

  const handleMouseMove = (_e: React.MouseEvent<SVGRectElement>, bar: typeof bars[0]) => {
    setTooltipData(bar.data);
    setTooltipPosition({ x: bar.x + bar.width / 2, y: bar.y });
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
    lineHeight: tokens.typography.small.lineHeight,
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
        onMouseLeave={handleMouseLeave}
      >
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

        {maxValue > 0 && (
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
              0
            </text>
          </>
        )}

        {bars.map((bar, i) => (
          <g key={`bar-${i}`}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx={parseInt(tokens.radii.sm, 10)}
              style={{ transition: 'opacity 300ms ease' }}
              onMouseMove={(e) => handleMouseMove(e, bar)}
            />
            <text
              x={bar.x + bar.width / 2}
              y={padding + innerHeight + 16}
              textAnchor="middle"
              style={{
                ...axisLabelStyle,
                fontSize: '10px',
              }}
            >
              {bar.data.plantName.length > 8
                ? bar.data.plantName.substring(0, 8) + '...'
                : bar.data.plantName}
            </text>
          </g>
        ))}
      </svg>

      <div style={tooltipStyle}>
        {tooltipData && (
          <>
            <div style={{ fontWeight: 600 }}>{tooltipData.plantName}</div>
            <div>
              {tooltipData.value} {tooltipData.value === 1 ? 'dispatch' : 'dispatches'}
            </div>
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

export default PlantChart;