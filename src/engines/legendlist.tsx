import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { LegendList } from '@legendapp/list/react-native';
import { VIEWABILITY_CONFIG } from '../core/engineContract';
import type { LegendListRef } from '@legendapp/list/react-native';
import type {
  EmojiListEngineProps,
  EmojiListHandle,
} from '../core/engineContract';

/**
 * LegendList adapter. recycleItems is REQUIRED — LegendList does not recycle
 * by default. estimatedItemSize is the exact row height (rows dominate the
 * list; headers are the rare exception). No getItemType on purpose.
 */
export const LegendListEngine = forwardRef<EmojiListHandle, EmojiListEngineProps>(
  function LegendListEngine(props, ref) {
    const listRef = useRef<LegendListRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex: (params) => {
          listRef.current?.scrollToIndex(params);
        },
      }),
      []
    );

    return (
      <LegendList
        ref={listRef}
        data={props.data}
        renderItem={props.renderItem}
        keyExtractor={props.keyExtractor}
        recycleItems
        maintainVisibleContentPosition
        estimatedItemSize={props.rowHeight}
        stickyHeaderIndices={props.stickyHeaderIndices}
        onViewableItemsChanged={props.onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        renderScrollComponent={props.ScrollComponent as never}
        contentContainerStyle={props.contentContainerStyle as never}
        keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={props.showsVerticalScrollIndicator}
        extraData={props.extraData}
      />
    );
  }
);
