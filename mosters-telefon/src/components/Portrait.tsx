import { useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';

import { TilePalette } from '../theme';

type Props = {
  photoUri?: string;
  palette: TilePalette;
  style?: ViewStyle;
};

// Contact photo, or a coloured silhouette (as in the mockup) when there is none.
export function Portrait({ photoUri, palette, style }: Props) {
  const [size, setSize] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(Math.min(width, height));
  };

  return (
    <View style={[styles.frame, { backgroundColor: palette.background }, style]} onLayout={onLayout}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        size > 0 && <Silhouette size={size * 0.62} color={palette.figure} />
      )}
    </View>
  );
}

function Silhouette({ size, color }: { size: number; color: string }) {
  const head = size * 0.38;
  const bodyWidth = size * 0.74;
  const bodyHeight = size * 0.33;
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View style={{ marginTop: size * 0.16, width: head, height: head, borderRadius: head / 2, backgroundColor: color }} />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.05,
          width: bodyWidth,
          height: bodyHeight,
          borderTopLeftRadius: bodyWidth / 2,
          borderTopRightRadius: bodyWidth / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
