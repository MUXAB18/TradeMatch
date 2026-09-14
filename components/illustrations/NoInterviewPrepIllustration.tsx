/**
 * No Interview Prep Illustration
 * Simple line art illustration for empty interview prep cards state
 */

import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface NoInterviewPrepIllustrationProps {
  size?: number;
  color?: string;
}

export default function NoInterviewPrepIllustration({ 
  size = 120, 
  color = '#007AFF' 
}: NoInterviewPrepIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Stack of cards - back card */}
      <Rect
        x="35"
        y="35"
        width="55"
        height="70"
        rx="8"
        stroke={color}
        strokeWidth="4"
        fill="none"
        opacity="0.3"
      />
      
      {/* Stack of cards - middle card */}
      <Rect
        x="30"
        y="30"
        width="55"
        height="70"
        rx="8"
        stroke={color}
        strokeWidth="4"
        fill="none"
        opacity="0.5"
      />
      
      {/* Stack of cards - front card */}
      <Rect
        x="25"
        y="25"
        width="55"
        height="70"
        rx="8"
        stroke={color}
        strokeWidth="5"
        fill="none"
      />
      
      {/* Question mark on front card */}
      <Circle
        cx="52.5"
        cy="55"
        r="3"
        fill={color}
      />
      <Path
        d="M52.5 50Q52.5 43 57.5 43Q62.5 43 62.5 48Q62.5 53 52.5 55"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Text lines on card - dashed */}
      <Path
        d="M35 75H65"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3 3"
        opacity="0.4"
      />
      <Path
        d="M35 82H60"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3 3"
        opacity="0.4"
      />
    </Svg>
  );
}
