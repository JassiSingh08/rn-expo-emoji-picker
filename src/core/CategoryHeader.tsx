import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface CategoryHeaderProps {
  title: string;
  height: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
}

export const CategoryHeader = memo(function CategoryHeader({
  title,
  height,
  fontSize,
  color,
  backgroundColor,
}: CategoryHeaderProps) {
  return (
    <View style={[styles.header, { height, backgroundColor }]}>
      <Text style={[styles.title, { fontSize, color }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
