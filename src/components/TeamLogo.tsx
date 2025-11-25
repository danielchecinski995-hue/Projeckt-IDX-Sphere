import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path, Circle } from 'react-native-svg';

interface TeamLogoProps {
  logoUrl?: string;
  teamName: string;
  size?: number;
}

// Default football/soccer team logo (shield with ball)
const DefaultTeamLogo = ({ size = 40 }: { size: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Shield shape */}
      <Path
        d="M 24 4 L 40 10 L 40 20 Q 40 32 24 44 Q 8 32 8 20 L 8 10 Z"
        fill="#2563eb"
        stroke="#1e40af"
        strokeWidth="2"
      />

      {/* Soccer ball */}
      <Circle cx="24" cy="22" r="10" fill="#FFFFFF" stroke="#1e40af" strokeWidth="1.5" />

      {/* Pentagon pattern on ball */}
      <Path
        d="M 24 14 L 26.5 19 L 32 19.5 L 27.5 23.5 L 28.5 29 L 24 26 L 19.5 29 L 20.5 23.5 L 16 19.5 L 21.5 19 Z"
        fill="#1e40af"
      />
    </Svg>
  );
};

export default function TeamLogo({ logoUrl, teamName, size = 40 }: TeamLogoProps) {
  if (logoUrl && logoUrl.trim() !== '') {
    return (
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image
          source={{ uri: logoUrl }}
          style={[styles.logo, { width: size, height: size }]}
          contentFit="contain"
          transition={200}
        />
      </View>
    );
  }

  // Show default logo if no URL provided
  return (
    <View style={[styles.defaultLogo, { width: size, height: size }]}>
      <DefaultTeamLogo size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    borderRadius: 4,
  },
  defaultLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
