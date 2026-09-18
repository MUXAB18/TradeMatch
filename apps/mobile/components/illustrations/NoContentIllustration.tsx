/**
 * No Content Illustration
 * Generic empty state illustration for lists or content areas with no data
 */

import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface NoContentIllustrationProps {
  size?: number;
  color?: string;
}

export default function NoContentIllustration({ 
  size = 120, 
  color = '#007AFF' 
}: NoContentIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Empty box/container */}
      <Rect
        x="30"
        y="35"
        width="60"
        height="50"
        rx="6"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Open lid/flap - perspective view */}
      <Path
        d="M30 35L25 25L95 25L90 35"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Empty indicator - three dots */}
      <Circle cx="50" cy="60" r="3" fill={color} opacity="0.4" />
      <Circle cx="60" cy="60" r="3" fill={color} opacity="0.4" />
      <Circle cx="70" cy="60" r="3" fill={color} opacity="0.4" />
    </Svg>
  );
}
