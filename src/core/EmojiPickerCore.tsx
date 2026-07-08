import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { CategoryHeader } from './CategoryHeader';
import { CategoryTabBar } from './CategoryTabBar';
import { DATA_CATEGORY_ORDER, getEmojisForCategory } from './data';
import { DEVICE_MAX_EMOJI_VERSION } from './deviceEmojiVersion';
import { EmojiRow } from './EmojiRow';
import { flattenSections, flattenSearchResults } from './rows';
import type { ComponentType } from 'react';
import type { EmojiRowProps } from './EmojiRow';
import { SearchBar } from './SearchBar';
import { searchEmojis } from './search';
import { applyToneToTemplate, displayEmoji, toUnicodeString } from './skinTone';
import { SkinToneSelector } from './SkinToneSelector';
import { resolveStrings } from './strings';
import { defaultStorage } from './storage';
import { darkTheme, lightTheme, resolveTheme } from './theme';
import { useRecents } from './useRecents';
import { VariantOverlay } from './VariantOverlay';
import type { CategorySection } from './rows';
import type {
  EmojiListEngine,
  EmojiListHandle,
  EmojiListViewToken,
  PickerListItem,
} from './engineContract';
import type {
  EmojiCategoryKey,
  EmojiItem,
  EmojiPickerProps,
  SkinTone,
  VariantAnchor,
} from './types';

const DEFAULT_STORAGE_KEY = 'rn-s-emogi-picker:recents';
const HEADER_EXTRA_HEIGHT = 19;
const HAND_TEMPLATE = '✋{t}';

const keyExtractor = (item: PickerListItem) => item.key;

/**
 * Builds a fully wired EmojiPicker around any list engine that implements
 * the {@link EmojiListEngine} contract. All shipped entry points (FlashList,
 * LegendList, FlatList, native) are created through this. `Row` swaps the
 * row renderer — the `/native` entry passes the native-backed row.
 */
export function createEmojiPicker(
  Engine: EmojiListEngine,
  Row: ComponentType<EmojiRowProps> = EmojiRow
) {
  return function EmojiPicker(props: EmojiPickerProps) {
    const {
      onEmojiSelected,
      numColumns = 8,
      categories,
      maxEmojiVersion = 'auto',
      colorScheme = 'auto',
      theme: themeOverride,
      strings: stringsOverride,
      enableSearch = true,
      searchDebounceMs = 250,
      enableRecentlyUsed = true,
      recentlyUsedLimit = 16,
      storage = defaultStorage,
      storageKey = DEFAULT_STORAGE_KEY,
      enableSkinToneSelector = true,
      skinTone: controlledTone,
      defaultSkinTone = 'default',
      onSkinToneChange,
      ScrollComponent,
      onCategoryChanged,
      headerRight,
      categoryBarPosition = 'top',
      excludeEmojis,
      style,
      contentContainerStyle,
    } = props;

    const systemScheme = useColorScheme();
    const scheme = colorScheme === 'auto' ? (systemScheme ?? 'light') : colorScheme;
    const theme = useMemo(
      () => resolveTheme(scheme === 'dark' ? darkTheme : lightTheme, themeOverride),
      [scheme, themeOverride]
    );
    const strings = useMemo(() => resolveStrings(stringsOverride), [stringsOverride]);

    const rowHeight = theme.emojiSize + theme.cellPadding * 2;
    const headerHeight = theme.headerFontSize + HEADER_EXTRA_HEIGHT;

    // --- skin tone (controlled + uncontrolled) ---
    const [internalTone, setInternalTone] = useState<SkinTone>(defaultSkinTone);
    const tone = controlledTone ?? internalTone;
    const toneRef = useRef(tone);
    toneRef.current = tone;
    const [toneSelectorOpen, setToneSelectorOpen] = useState(false);

    const handleToneSelected = useCallback(
      (next: SkinTone) => {
        if (controlledTone === undefined) setInternalTone(next);
        onSkinToneChange?.(next);
        setToneSelectorOpen(false);
      },
      [controlledTone, onSkinToneChange]
    );

    // --- search ---
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
      if (query.trim() === '') {
        setDebouncedQuery('');
        return;
      }
      const timer = setTimeout(() => setDebouncedQuery(query), searchDebounceMs);
      return () => clearTimeout(timer);
    }, [query, searchDebounceMs]);
    const isSearching = debouncedQuery.trim().length > 0;
    const isSearchingRef = useRef(isSearching);
    isSearchingRef.current = isSearching;

    // --- recents ---
    const { recentItems, addRecent } = useRecents(
      storage,
      storageKey,
      enableRecentlyUsed,
      recentlyUsedLimit
    );

    // --- data ---
    const resolvedMaxVersion =
      maxEmojiVersion === 'auto' ? DEVICE_MAX_EMOJI_VERSION : maxEmojiVersion;
    const excludeSet = useMemo(
      () => (excludeEmojis?.length ? new Set(excludeEmojis) : null),
      [excludeEmojis]
    );
    const baseSections = useMemo<CategorySection[]>(() => {
      const order = categories ?? DATA_CATEGORY_ORDER;
      return order.map((key) => {
        const all = getEmojisForCategory(key);
        const emojis =
          resolvedMaxVersion == null && excludeSet == null
            ? all
            : all.filter(
                (e) =>
                  (resolvedMaxVersion == null || e.version <= resolvedMaxVersion) &&
                  !excludeSet?.has(e.emoji)
              );
        return { category: key, title: strings.categories[key], emojis };
      });
    }, [categories, resolvedMaxVersion, excludeSet, strings]);

    const searchableItems = useMemo(
      () => baseSections.flatMap((s) => s.emojis),
      [baseSections]
    );

    const flattened = useMemo(() => {
      if (isSearching) {
        return flattenSearchResults(
          searchEmojis(searchableItems, debouncedQuery),
          numColumns
        );
      }
      const sections =
        recentItems.length > 0
          ? [
              {
                category: 'recently_used' as const,
                title: strings.categories.recently_used,
                emojis: recentItems,
              },
              ...baseSections,
            ]
          : baseSections;
      return flattenSections(sections, numColumns);
    }, [
      isSearching,
      debouncedQuery,
      searchableItems,
      baseSections,
      recentItems,
      numColumns,
      strings,
    ]);
    const flattenedRef = useRef(flattened);
    flattenedRef.current = flattened;

    // --- active category tracking ---
    const tabCategories = useMemo<EmojiCategoryKey[]>(() => {
      const order = categories ?? DATA_CATEGORY_ORDER;
      return recentItems.length > 0 && !isSearching
        ? ['recently_used', ...order]
        : [...order];
    }, [categories, recentItems.length, isSearching]);

    const [activeCategory, setActiveCategory] = useState<EmojiCategoryKey | null>(
      tabCategories[0] ?? null
    );
    const activeCategoryRef = useRef(activeCategory);
    const onCategoryChangedRef = useRef(onCategoryChanged);
    onCategoryChangedRef.current = onCategoryChanged;

    // Both FlashList and FlatList require a referentially stable
    // onViewableItemsChanged — route through a ref to the latest closure.
    const handleViewableItemsChanged = useRef(
      (info: { viewableItems: EmojiListViewToken[] }) => {
        if (isSearchingRef.current) return;
        const first = info.viewableItems.find((t) => t.isViewable && t.item);
        const category = first?.item?.category;
        if (category && category !== activeCategoryRef.current) {
          activeCategoryRef.current = category;
          setActiveCategory(category);
          onCategoryChangedRef.current?.(category);
        }
      }
    ).current;

    const listRef = useRef<EmojiListHandle>(null);
    const handleSelectCategory = useCallback((category: EmojiCategoryKey) => {
      const index = flattenedRef.current.headerIndexByCategory[category];
      if (index == null) return;
      activeCategoryRef.current = category;
      setActiveCategory(category);
      onCategoryChangedRef.current?.(category);
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index, animated: false });
      });
    }, []);

    // --- selection ---
    const onEmojiSelectedRef = useRef(onEmojiSelected);
    onEmojiSelectedRef.current = onEmojiSelected;
    const addRecentRef = useRef(addRecent);
    addRecentRef.current = addRecent;

    const emitSelection = useCallback(
      (item: EmojiItem, selectedTone: SkinTone, category: EmojiCategoryKey) => {
        const glyph = displayEmoji(item, selectedTone);
        onEmojiSelectedRef.current({
          emoji: glyph,
          unicode: toUnicodeString(glyph),
          name: item.name,
          category,
          skinTone: item.toneTemplate ? selectedTone : 'default',
          baseEmoji: item.emoji,
        });
        addRecentRef.current(item);
      },
      []
    );

    const handleEmojiPress = useCallback(
      (item: EmojiItem, category: EmojiCategoryKey) => {
        emitSelection(item, toneRef.current, category);
      },
      [emitSelection]
    );

    const containerRef = useRef<View>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const handleContainerLayout = useCallback(
      (e: { nativeEvent: { layout: { width: number } } }) => {
        setContainerWidth(e.nativeEvent.layout.width);
      },
      []
    );

    const [variant, setVariant] = useState<{
      item: EmojiItem;
      category: EmojiCategoryKey;
      x: number;
      y: number;
    } | null>(null);
    const variantRef = useRef(variant);
    variantRef.current = variant;
    const handleEmojiLongPress = useCallback(
      (item: EmojiItem, category: EmojiCategoryKey, anchor: VariantAnchor) => {
        // Anchor arrives in page coordinates; the popover positions inside
        // the picker container, so convert before storing.
        containerRef.current?.measureInWindow((cx, cy) => {
          setVariant({ item, category, x: anchor.x - cx, y: anchor.y - cy });
        });
      },
      []
    );
    const handleVariantSelect = useCallback(
      (item: EmojiItem, selectedTone: SkinTone) => {
        emitSelection(
          item,
          selectedTone,
          variantRef.current?.category ?? item.category
        );
        setVariant(null);
      },
      [emitSelection]
    );
    const dismissVariant = useCallback(() => setVariant(null), []);

    // --- rendering ---
    const renderItem = useCallback(
      ({ item }: { item: PickerListItem; index: number }) => {
        if (item.type === 'header') {
          return (
            <CategoryHeader
              title={item.title}
              height={headerHeight}
              fontSize={theme.headerFontSize}
              color={theme.colors.secondaryText}
              backgroundColor={theme.colors.background}
            />
          );
        }
        return (
          <Row
            emojis={item.emojis}
            category={item.category}
            numColumns={numColumns}
            rowHeight={rowHeight}
            emojiSize={theme.emojiSize}
            skinTone={tone}
            onPress={handleEmojiPress}
            onLongPress={handleEmojiLongPress}
          />
        );
      },
      [
        headerHeight,
        rowHeight,
        numColumns,
        tone,
        theme,
        handleEmojiPress,
        handleEmojiLongPress,
      ]
    );

    const extraData = useMemo(() => ({ tone, theme }), [tone, theme]);
    const showEmpty = isSearching && flattened.items.length === 0;

    const tabBar =
      categoryBarPosition === 'hidden' ? null : (
        <CategoryTabBar
          categories={tabCategories}
          activeCategory={activeCategory}
          theme={theme}
          strings={strings}
          onSelect={handleSelectCategory}
          position={categoryBarPosition}
        />
      );

    return (
      <View
        ref={containerRef}
        onLayout={handleContainerLayout}
        style={[styles.container, { backgroundColor: theme.colors.background }, style]}
      >
        {(enableSearch || enableSkinToneSelector || headerRight != null) && (
          <View style={styles.topRow}>
            {enableSearch && (
              <SearchBar
                value={query}
                onChangeText={setQuery}
                theme={theme}
                strings={strings}
              />
            )}
            {enableSkinToneSelector && (
              <Pressable
                onPress={() => setToneSelectorOpen((open) => !open)}
                style={[
                  styles.toneButton,
                  { backgroundColor: theme.colors.searchBackground },
                ]}
                accessibilityRole="button"
                accessibilityLabel={strings.skinToneSelector}
                accessibilityState={{ expanded: toneSelectorOpen }}
              >
                <Text
                  style={{ fontSize: theme.categoryBarIconSize + 2 }}
                  allowFontScaling={false}
                >
                  {applyToneToTemplate(HAND_TEMPLATE, tone)}
                </Text>
              </Pressable>
            )}
            {headerRight}
          </View>
        )}
        {toneSelectorOpen && (
          <SkinToneSelector
            selectedTone={tone}
            theme={theme}
            onSelect={handleToneSelected}
          />
        )}
        {categoryBarPosition === 'top' && tabBar}
        <View style={styles.listWrap}>
          {showEmpty ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
                {strings.noResults}
              </Text>
            </View>
          ) : (
            <Engine
              ref={listRef}
              data={flattened.items}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              stickyHeaderIndices={flattened.stickyHeaderIndices}
              rowHeight={rowHeight}
              headerHeight={headerHeight}
              onViewableItemsChanged={handleViewableItemsChanged}
              ScrollComponent={ScrollComponent}
              contentContainerStyle={contentContainerStyle}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              extraData={extraData}
            />
          )}
        </View>
        {categoryBarPosition === 'bottom' && tabBar}
        {variant && (
          <VariantOverlay
            item={variant.item}
            theme={theme}
            anchorX={variant.x}
            anchorY={variant.y}
            containerWidth={containerWidth}
            rowHeight={rowHeight}
            onSelect={handleVariantSelect}
            onDismiss={dismissVariant}
          />
        )}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toneButton: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWrap: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
  },
});
