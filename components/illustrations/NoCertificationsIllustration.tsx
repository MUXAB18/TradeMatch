/**
 * No Certifications Illustration
 * Simple line art illustration for empty certifications state
 */

import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface NoCertificationsIllustrationProps {
  size?: number;
  color?: string;
}

export default function NoCertificationsIllustration({ 
  size = 120, 
  color = '#007AFF' 
}: NoCertificationsIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Certificate/document outline */}
      <Rect
        x="25"
        y="30"
        width="70"
        height="60"
        rx="4"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Ribbon/seal at bottom */}
      <Circle
        cx="60"
        cy="90"
        r="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Ribbon tails */}
      <Path
        d="M52 95L48 108"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M68 95L72 108"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Text lines on certificate - dashed to indicate "empty" */}
      <Path
        d="M35 45H85"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <Path
        d="M35 55H75"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <Path
        d="M35 65H80"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
    </Svg>
  );
}
