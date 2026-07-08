import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICONS } from './strings';
import type { LayoutChangeEvent } from 'react-native';
import type { EmojiCategoryKey, EmojiPickerStrings, EmojiPickerTheme } from './types';

interface TabProps {
  category: EmojiCategoryKey;
  label: string;
  active: boolean;
  iconSize: number;
  activeBackground: string;
  onSelect: (category: EmojiCategoryKey) => void;
  onTabLayout: (category: EmojiCategoryKey, x: number, width: number) => void;
}

const Tab = memo(function Tab({
  category,
  label,
  active,
  iconSize,
  activeBackground,
  onSelect,
  onTabLayout,
}: TabProps) {
  const handlePress = useCallback(() => onSelect(category), [onSelect, category]);
  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      onTabLayout(category, e.nativeEvent.layout.x, e.nativeEvent.layout.width);
    },
    [onTabLayout, category]
  );
  return (
    <Pressable
      onPress={handlePress}
      onLayout={handleLayout}
      style={[styles.tab, active && { backgroundColor: activeBackground }]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={{ fontSize: iconSize }} allowFontScaling={false}>
        {CATEGORY_ICONS[category]}
      </Text>
    </Pressable>
  );
});

export interface CategoryTabBarProps {
  categories: EmojiCategoryKey[];
  activeCategory: EmojiCategoryKey | null;
  theme: EmojiPickerTheme;
  strings: EmojiPickerStrings;
  onSelect: (category: EmojiCategoryKey) => void;
}

export const CategoryTabBar = memo(function CategoryTabBar({
  categories,
  activeCategory,
  theme,
  strings,
  onSelect,
}: CategoryTabBarProps) {
  const scrollRef = useRef<ScrollView>(null);
  // Geometry lives in refs — layout events must never re-render the bar.
  const tabLayouts = useRef<
    Partial<Record<EmojiCategoryKey, { x: number; width: number }>>
  >({});
  const barWidth = useRef(0);
  const contentWidth = useRef(0);

  const handleTabLayout = useCallback(
    (category: EmojiCategoryKey, x: number, width: number) => {
      tabLayouts.current[category] = { x, width };
    },
    []
  );
  const handleBarLayout = useCallback((e: LayoutChangeEvent) => {
    barWidth.current = e.nativeEvent.layout.width;
  }, []);
  const handleContentSizeChange = useCallback((w: number) => {
    contentWidth.current = w;
  }, []);

  // Keep the active tab visible when the bar overflows: the auto-highlight
  // from list scrolling can land on a tab that is off-screen, which would
  // otherwise require the user to scroll the bar by hand.
  useEffect(() => {
    if (!activeCategory) return;
    const overflow = contentWidth.current - barWidth.current;
    if (overflow <= 0) return;
    const tab = tabLayouts.current[activeCategory];
    if (!tab) return;
    const target = tab.x + tab.width / 2 - barWidth.current / 2;
    scrollRef.current?.scrollTo({
      x: Math.max(0, Math.min(overflow, target)),
      animated: true,
    });
  }, [activeCategory]);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.categoryBarBackground,
          borderBottomColor: theme.colors.divider,
        },
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onLayout={handleBarLayout}
        onContentSizeChange={handleContentSizeChange}
      >
        {categories.map((category) => (
          <Tab
            key={category}
            category={category}
            label={strings.categories[category]}
            active={category === activeCategory}
            iconSize={theme.categoryBarIconSize}
            activeBackground={theme.colors.categoryActiveBackground}
            onSelect={onSelect}
            onTabLayout={handleTabLayout}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
