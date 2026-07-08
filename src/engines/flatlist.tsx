import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { FlatList } from 'react-native';
import { VIEWABILITY_CONFIG } from '../core/engineContract';
import type {
  EmojiListEngineProps,
  EmojiListHandle,
  PickerListItem,
} from '../core/engineContract';

/**
 * Plain FlatList fallback for apps stuck on the legacy architecture.
 * Reduced performance and no sticky headers: ScrollView-level
 * stickyHeaderIndices indexes *rendered children*, which drift under
 * virtualization, so they are intentionally not forwarded here.
 */
export const FlatListEngine = forwardRef<EmojiListHandle, EmojiListEngineProps>(
  function FlatListEngine(props, ref) {
    const listRef = useRef<FlatList<PickerListItem>>(null);
    const { rowHeight, headerHeight, data, ScrollComponent } = props;

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex: (params) => {
          listRef.current?.scrollToIndex(params);
        },
      }),
      []
    );

    // Exact per-item layout lets scrollToIndex jump anywhere instantly.
    const layouts = useMemo(() => {
      let offset = 0;
      return data.map((item) => {
        const length = item.type === 'header' ? headerHeight : rowHeight;
        const entry = { length, offset };
        offset += length;
        return entry;
      });
    }, [data, rowHeight, headerHeight]);

    const getItemLayout = useCallback(
      (_: unknown, index: number) => ({
        length: layouts[index]?.length ?? rowHeight,
        offset: layouts[index]?.offset ?? 0,
        index,
      }),
      [layouts, rowHeight]
    );

    const renderScrollComponent = useMemo(() => {
      if (!ScrollComponent) return undefined;
      return (scrollProps: object) => <ScrollComponent {...scrollProps} />;
    }, [ScrollComponent]);

    return (
      <FlatList
        ref={listRef}
        data={data}
        renderItem={props.renderItem}
        keyExtractor={props.keyExtractor}
        getItemLayout={getItemLayout}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onViewableItemsChanged={props.onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        renderScrollComponent={renderScrollComponent}
        contentContainerStyle={props.contentContainerStyle}
        keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={props.showsVerticalScrollIndicator}
        extraData={props.extraData}
        windowSize={7}
        maxToRenderPerBatch={8}
        initialNumToRender={12}
        removeClippedSubviews
      />
    );
  }
);
