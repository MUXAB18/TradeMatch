/**
 * No Jobs Illustration
 * Simple line art illustration for empty job matches state
 */

import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface NoJobsIllustrationProps {
  size?: number;
  color?: string;
}

export default function NoJobsIllustration({ 
  size = 120, 
  color = '#007AFF' 
}: NoJobsIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Magnifying glass handle */}
      <Path
        d="M75 75L95 95"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Magnifying glass circle */}
      <Circle
        cx="50"
        cy="50"
        r="30"
        stroke={color}
        strokeWidth="5"
        fill="none"
      />
      
      {/* Search "nothing found" indicator - small X or dots */}
      <G opacity="0.6">
        <Circle cx="45" cy="45" r="2" fill={color} />
        <Circle cx="55" cy="45" r="2" fill={color} />
        <Path
          d="M45 55Q50 58 55 55"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}
