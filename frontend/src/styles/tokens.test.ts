import { tokens } from './tokens';

describe('Design Tokens', () => {
  describe('tokens object structure', () => {
    it('should be defined', () => {
      expect(tokens).toBeDefined();
    });

    it('should have all required top-level properties', () => {
      expect(tokens).toHaveProperty('colors');
      expect(tokens).toHaveProperty('typography');
      expect(tokens).toHaveProperty('spacing');
      expect(tokens).toHaveProperty('radii');
      expect(tokens).toHaveProperty('shadows');
      expect(tokens).toHaveProperty('iconImageStyle');
      expect(tokens).toHaveProperty('motionInteraction');
      expect(tokens).toHaveProperty('chart');
    });
  });

  describe('colors', () => {
    const { colors } = tokens;

    it('should have primary color and its variants', () => {
      expect(colors.primary).toBe('#1E3A5F');
      expect(colors.primaryLight).toBe('#2B5A8C');
    });

    it('should have secondary color', () => {
      expect(colors.secondary).toBe('#4A90D9');
    });

    it('should have accent color', () => {
      expect(colors.accent).toBe('#27AE60');
    });

    it('should have background colors', () => {
      expect(colors.background).toBe('#F4F6F9');
      expect(colors.darkBackground).toBe('#1A1A2E');
    });

    it('should have surface colors', () => {
      expect(colors.surface).toBe('#FFFFFF');
      expect(colors.darkSurface).toBe('#2D2D44');
    });

    it('should have text colors', () => {
      expect(colors.textPrimary).toBe('#1A1A2E');
      expect(colors.textSecondary).toBe('#6B7280');
      expect(colors.darkTextPrimary).toBe('#EAEAEA');
      expect(colors.darkTextSecondary).toBe('#A0A0B0');
    });

    it('should have border colors', () => {
      expect(colors.border).toBe('#D1D5DB');
      expect(colors.darkBorder).toBe('#3D3D5C');
    });

    it('should have status colors', () => {
      expect(colors.error).toBe('#E74C3C');
      expect(colors.warning).toBe('#F39C12');
      expect(colors.success).toBe('#27AE60');
      expect(colors.info).toBe('#3498DB');
    });

    it('should have badge colors for dispatch status', () => {
      expect(colors.badgeDelivered).toBe('#27AE60');
      expect(colors.badgeInTransit).toBe('#3498DB');
      expect(colors.badgePending).toBe('#F39C12');
      expect(colors.badgeCancelled).toBe('#E74C3C');
    });

    it('all color values should be valid hex strings', () => {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      const colorKeys = [
        'primary', 'primaryLight', 'secondary', 'accent', 'background',
        'surface', 'textPrimary', 'textSecondary', 'border', 'error',
        'warning', 'success', 'info', 'darkBackground', 'darkSurface',
        'darkTextPrimary', 'darkTextSecondary', 'darkBorder',
        'badgeDelivered', 'badgeInTransit', 'badgePending', 'badgeCancelled'
      ];
      
      colorKeys.forEach((key) => {
        expect(colors[key as keyof typeof colors]).toMatch(hexRegex);
      });
    });

    it('should have exactly 22 color properties', () => {
      expect(Object.keys(colors)).toHaveLength(22);
    });
  });

  describe('typography', () => {
    const { typography } = tokens;

    it('should have fontFamily', () => {
      expect(typography.fontFamily).toBe('Inter, system-ui, sans-serif');
    });

    describe('headings', () => {
      const { headings } = typography;

      it('should have h1, h2, h3 headings', () => {
        expect(headings).toHaveProperty('h1');
        expect(headings).toHaveProperty('h2');
        expect(headings).toHaveProperty('h3');
      });

      it('h1 should have correct properties', () => {
        expect(headings.h1.size).toBe('28px');
        expect(headings.h1.weight).toBe(700);
        expect(headings.h1.lineHeight).toBe(1.3);
      });

      it('h2 should have correct properties', () => {
        expect(headings.h2.size).toBe('22px');
        expect(headings.h2.weight).toBe(600);
        expect(headings.h2.lineHeight).toBe(1.4);
      });

      it('h3 should have correct properties', () => {
        expect(headings.h3.size).toBe('18px');
        expect(headings.h3.weight).toBe(600);
        expect(headings.h3.lineHeight).toBe(1.4);
      });

      it('heading font sizes should be in descending order', () => {
        const h1Size = parseInt(headings.h1.size);
        const h2Size = parseInt(headings.h2.size);
        const h3Size = parseInt(headings.h3.size);
        
        expect(h1Size).toBeGreaterThan(h2Size);
        expect(h2Size).toBeGreaterThan(h3Size);
      });

      it('heading weights should be valid numbers', () => {
        expect(typeof headings.h1.weight).toBe('number');
        expect(typeof headings.h2.weight).toBe('number');
        expect(typeof headings.h3.weight).toBe('number');
      });
    });

    describe('body and small text', () => {
      it('body should have correct properties', () => {
        expect(typography.body.size).toBe('14px');
        expect(typography.body.weight).toBe(400);
        expect(typography.body.lineHeight).toBe(1.5);
      });

      it('small should have correct properties', () => {
        expect(typography.small.size).toBe('12px');
        expect(typography.small.weight).toBe(400);
        expect(typography.small.lineHeight).toBe(1.4);
      });
    });

    describe('KPI typography', () => {
      it('kpiValue should have correct properties', () => {
        expect(typography.kpiValue.size).toBe('32px');
        expect(typography.kpiValue.weight).toBe(700);
        expect(typography.kpiValue.lineHeight).toBe(1.2);
      });

      it('kpiLabel should have correct properties', () => {
        expect(typography.kpiLabel.size).toBe('14px');
        expect(typography.kpiLabel.weight).toBe(500);
        expect(typography.kpiLabel.lineHeight).toBe(1.4);
      });

      it('kpiValue should have larger font size than kpiLabel', () => {
        const kpiValueSize = parseInt(typography.kpiValue.size);
        const kpiLabelSize = parseInt(typography.kpiLabel.size);
        
        expect(kpiValueSize).toBeGreaterThan(kpiLabelSize);
      });

      it('kpiValue should be bolder than kpiLabel', () => {
        expect(typography.kpiValue.weight).toBeGreaterThan(typography.kpiLabel.weight);
      });
    });

    it('should have exactly 6 typography properties', () => {
      expect(Object.keys(typography)).toHaveLength(6);
    });
  });

  describe('spacing', () => {
    const { spacing } = tokens;

    it('should have all spacing values', () => {
      expect(spacing).toHaveProperty('xs');
      expect(spacing).toHaveProperty('sm');
      expect(spacing).toHaveProperty('md');
      expect(spacing).toHaveProperty('lg');
      expect(spacing).toHaveProperty('xl');
      expect(spacing).toHaveProperty('xxl');
    });

    it('should have correct spacing values', () => {
      expect(spacing.xs).toBe('4px');
      expect(spacing.sm).toBe('8px');
      expect(spacing.md).toBe('16px');
      expect(spacing.lg).toBe('24px');
      expect(spacing.xl).toBe('32px');
      expect(spacing.xxl).toBe('48px');
    });

    it('spacing values should follow 4px base increment', () => {
      const values = [
        parseInt(spacing.xs),
        parseInt(spacing.sm),
        parseInt(spacing.md),
        parseInt(spacing.lg),
        parseInt(spacing.xl),
        parseInt(spacing.xxl)
      ];
      
      values.forEach((val) => {
        expect(val % 4).toBe(0);
      });
    });

    it('spacing values should be in ascending order', () => {
      const values = [
        parseInt(spacing.xs),
        parseInt(spacing.sm),
        parseInt(spacing.md),
        parseInt(spacing.lg),
        parseInt(spacing.xl),
        parseInt(spacing.xxl)
      ];
      
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });

    it('should have exactly 6 spacing properties', () => {
      expect(Object.keys(spacing)).toHaveLength(6);
    });
  });

  describe('radii', () => {
    const { radii } = tokens;

    it('should have all radius values', () => {
      expect(radii).toHaveProperty('sm');
      expect(radii).toHaveProperty('md');
      expect(radii).toHaveProperty('lg');
      expect(radii).toHaveProperty('full');
    });

    it('should have correct radius values', () => {
      expect(radii.sm).toBe('4px');
      expect(radii.md).toBe('8px');
      expect(radii.lg).toBe('12px');
      expect(radii.full).toBe('9999px');
    });

    it('radius values should follow pattern', () => {
      const small = parseInt(radii.sm);
      const medium = parseInt(radii.md);
      const large = parseInt(radii.lg);
      
      expect(medium).toBeGreaterThan(small);
      expect(large).toBeGreaterThan(medium);
    });

    it('full radius should be a large value for pill shape', () => {
      const full = parseInt(radii.full);
      expect(full).toBeGreaterThan(100);
    });

    it('should have exactly 4 radius properties', () => {
      expect(Object.keys(radii)).toHaveLength(4);
    });
  });

  describe('shadows', () => {
    const { shadows } = tokens;

    it('should have all shadow values', () => {
      expect(shadows).toHaveProperty('card');
      expect(shadows).toHaveProperty('cardHover');
      expect(shadows).toHaveProperty('dropdown');
    });

    it('should have valid shadow values', () => {
      expect(shadows.card).toMatch(/^0 \d+px \d+px rgba/);
      expect(shadows.cardHover).toMatch(/^0 \d+px \d+px rgba/);
      expect(shadows.dropdown).toMatch(/^0 \d+px \d+px rgba/);
    });

    it('cardHover shadow should be more prominent than card', () => {
      const cardBlur = parseInt(shadows.card.match(/\d+px(?=\))?$/)?.[0] || '0');
      const cardHoverBlur = parseInt(shadows.cardHover.match(/\d+px(?=\))?$/)?.[0] || '0');
      
      expect(cardHoverBlur).toBeGreaterThan(cardBlur);
    });

    it('should have exactly 3 shadow properties', () => {
      expect(Object.keys(shadows)).toHaveLength(3);
    });
  });

  describe('iconImageStyle', () => {
    it('should be defined as a string', () => {
      expect(typeof tokens.iconImageStyle).toBe('string');
    });

    it('should mention Lucide React icons', () => {
      expect(tokens.iconImageStyle).toContain('Lucide React');
    });

    it('should specify icon size', () => {
      expect(tokens.iconImageStyle).toContain('20px');
    });

    it('should specify line art style', () => {
      expect(tokens.iconImageStyle).toContain('line art');
    });

    it('should specify color inherit', () => {
      expect(tokens.iconImageStyle).toContain('color inherit');
    });
  });

  describe('motionInteraction', () => {
    it('should be defined as a string', () => {
      expect(typeof tokens.motionInteraction).toBe('string');
    });

    it('should specify transition duration for hover', () => {
      expect(tokens.motionInteraction).toContain('300ms');
    });

    it('should specify transition for theme changes', () => {
      expect(tokens.motionInteraction).toContain('tema oscuro/claro');
    });

    it('should specify tooltip animation', () => {
      expect(tokens.motionInteraction).toContain('Tooltip');
      expect(tokens.motionInteraction).toContain('fade in');
      expect(tokens.motionInteraction).toContain('200ms');
    });

    it('should specify loading spinner animation', () => {
      expect(tokens.motionInteraction).toContain('Spinner');
      expect(tokens.motionInteraction).toContain('carga');
      expect(tokens.motionInteraction).toContain('animado');
    });
  });

  describe('chart', () => {
    const { chart } = tokens;

    it('should have chart configuration properties', () => {
      expect(chart).toHaveProperty('trendChartType');
      expect(chart).toHaveProperty('trendChartFill');
      expect(chart).toHaveProperty('trendChartStroke');
      expect(chart).toHaveProperty('trendChartShowGradient');
    });

    it('should have correct trend chart type', () => {
      expect(chart.trendChartType).toBe('area');
    });

    it('should have valid trend chart fill color', () => {
      const hexRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*[\d.]+)?\)$/;
      expect(chart.trendChartFill).toMatch(hexRegex);
    });

    it('should have valid trend chart stroke color', () => {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      expect(chart.trendChartStroke).toMatch(hexRegex);
    });

    it('should have boolean for gradient flag', () => {
      expect(typeof chart.trendChartShowGradient).toBe('boolean');
      expect(chart.trendChartShowGradient).toBe(true);
    });

    it('stroke color should match success color', () => {
      expect(chart.trendChartStroke).toBe(tokens.colors.success);
    });

    it('should have exactly 4 chart properties', () => {
      expect(Object.keys(chart)).toHaveLength(4);
    });
  });

  describe('integration scenarios', () => {
    it('badge colors should match corresponding status colors', () => {
      expect(tokens.colors.badgeDelivered).toBe(tokens.colors.success);
      expect(tokens.colors.badgeInTransit).toBe(tokens.colors.info);
      expect(tokens.colors.badgePending).toBe(tokens.colors.warning);
      expect(tokens.colors.badgeCancelled).toBe(tokens.colors.error);
    });

    it('dark theme colors should be distinct from light theme colors', () => {
      expect(tokens.colors.darkBackground).not.toBe(tokens.colors.background);
      expect(tokens.colors.darkSurface).not.toBe(tokens.colors.surface);
      expect(tokens.colors.darkTextPrimary).not.toBe(tokens.colors.textPrimary);
      expect(tokens.colors.darkTextSecondary).not.toBe(tokens.colors.textSecondary);
      expect(tokens.colors.darkBorder).not.toBe(tokens.colors.border);
    });

    it('should be able to use tokens for creating a complete component style', () => {
      const mockComponentStyles = {
        backgroundColor: tokens.colors.surface,
        color: tokens.colors.textPrimary,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.size,
        padding: tokens.spacing.md,
        borderRadius: tokens.radii.md,
        boxShadow: tokens.shadows.card,
      };

      expect(mockComponentStyles.backgroundColor).toBe('#FFFFFF');
      expect(mockComponentStyles.color).toBe('#1A1A2E');
      expect(mockComponentStyles.fontFamily).toBe('Inter, system-ui, sans-serif');
      expect(mockComponentStyles.fontSize).toBe('14px');
      expect(mockComponentStyles.padding).toBe('16px');
      expect(mockComponentStyles.borderRadius).toBe('8px');
      expect(mockComponentStyles.boxShadow).toBe('0 2px 8px rgba(0,0,0,0.08)');
    });

    it('should be able to build a dispatch status badge style', () => {
      const statusBadgeStyles: Record<string, object> = {
        delivered: {
          backgroundColor: tokens.colors.badgeDelivered,
          color: '#FFFFFF',
        },
        in_transit: {
          backgroundColor: tokens.colors.badgeInTransit,
          color: '#FFFFFF',
        },
        pending: {
          backgroundColor: tokens.colors.badgePending,
          color: '#FFFFFF',
        },
        cancelled: {
          backgroundColor: tokens.colors.badgeCancelled,
          color: '#FFFFFF',
        },
      };

      expect(statusBadgeStyles.delivered.backgroundColor).toBe('#27AE60');
      expect(statusBadgeStyles.in_transit.backgroundColor).toBe('#3498DB');
      expect(statusBadgeStyles.pending.backgroundColor).toBe('#F39C12');
      expect(statusBadgeStyles.cancelled.backgroundColor).toBe('#E74C3C');
    });
  });
});
