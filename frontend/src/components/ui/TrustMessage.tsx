import React from 'react';
import { tokens } from '../../styles/tokens';

interface TrustMessageProps {
  message?: string;
}

export default function TrustMessage({ message = 'Compra 100% segura con envío garantizado' }: TrustMessageProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing.md,
      backgroundColor: '#F0FAF4',
      borderRadius: tokens.border_radius.lg,
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
      border: `1px solid ${tokens.colors.success}`
    }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
          stroke={tokens.colors.success}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke={tokens.colors.success}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{
        fontFamily: tokens.typography.font_family,
        fontSize: tokens.typography.body.regular.size,
        fontWeight: tokens.typography.body.regular.weight,
        color: tokens.colors.success,
        lineHeight: tokens.typography.body.regular.line_height
      }}>
        {message}
      </span>
    </div>
  );
}