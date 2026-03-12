import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface KaabaIconProps {
  size?: number;
  color?: string;
}

const KaabaIcon: React.FC<KaabaIconProps> = ({ size = 32, color }) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 32 32">
      {/* Kaaba 3D Isometric Body */}
      {/* Front-left side */}
      <Path
        d="M7 11 L16 15 L16 26 L7 22 Z"
        fill={color || '#111827'}
        opacity={color ? 0.8 : 1}
      />
      {/* Front-right side */}
      <Path
        d="M16 15 L25 11 L25 22 L16 26 Z"
        fill={color || '#000000'}
      />
      {/* Top surface */}
      <Path
        d="M7 11 L16 7 L25 11 L16 15 Z"
        fill={color || '#374151'}
        opacity={color ? 0.6 : 1}
      />

      {/* Horizontal Golden Band (Kiswah) wrapping around */}
      <Path
        d="M7 14 L16 18 L25 14 L25 16 L16 20 L7 16 Z"
        fill={color ? color : '#F59E0B'}
        opacity={color ? 0.9 : 1}
      />

      {/* Small door detail */}
      <Path
        d="M18 19 L21 17.5 V23.5 L18 25 Z"
        fill={color ? color : '#F59E0B'}
        opacity={color ? 1 : 0.7}
      />
    </Svg>
  );
};

export default KaabaIcon;
