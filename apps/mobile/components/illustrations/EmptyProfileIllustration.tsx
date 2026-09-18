/**
 * Empty Profile Illustration
 * Simple line art illustration for incomplete or empty profile state
 */

import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface EmptyProfileIllustrationProps {
  size?: number;
  color?: string;
}

export default function EmptyProfileIllustration({ 
  size = 120, 
  color = '#007AFF' 
}: EmptyProfileIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Profile document/card background */}
      <Rect
        x="20"
        y="25"
        width="80"
        height="85"
        rx="8"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Person icon - head */}
      <Circle
        cx="45"
        cy="50"
        r="10"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      
      {/* Person icon - shoulders/body */}
      <Path
        d="M33 75Q33 65 45 65Q57 65 57 75"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Empty info lines - dashed to indicate "needs filling" */}
      <Path
        d="M65 45H90"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <Path
        d="M65 55H85"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <Path
        d="M65 65H88"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      
      {/* Bottom section lines */}
      <Path
        d="M30 88H90"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <Path
        d="M30 96H75"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
    </Svg>
  );
}
