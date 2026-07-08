import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import { VIEWABILITY_CONFIG } from '../core/engineContract';
import type { FlashListRef } from '@shopify/flash-list';
import type {
  EmojiListEngineProps,
  EmojiListHandle,
  PickerListItem,
} from '../core/engineContract';

const getItemType = (item: PickerListItem) => item.type;

/**
 * FlashList v2 adapter — the default engine. v2 auto-measures, so no
 * estimatedItemSize is passed; item pools are split by getItemType.
 */
export const FlashListEngine = forwardRef<EmojiListHandle, EmojiListEngineProps>(
  function FlashListEngine(props, ref) {
    const listRef = useRef<FlashListRef<PickerListItem>>(null);

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
      <FlashList
        ref={listRef}
        data={props.data}
        renderItem={props.renderItem}
        keyExtractor={props.keyExtractor}
        getItemType={getItemType}
        stickyHeaderIndices={props.stickyHeaderIndices}
        onViewableItemsChanged={props.onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        renderScrollComponent={props.ScrollComponent}
        contentContainerStyle={props.contentContainerStyle as never}
        keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={props.showsVerticalScrollIndicator}
        extraData={props.extraData}
      />
    );
  }
);
