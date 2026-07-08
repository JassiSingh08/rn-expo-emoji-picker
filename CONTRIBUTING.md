# Contributing

Thanks for helping out! This project requires the **React Native New Architecture** — please don't open PRs that add legacy-architecture-only code paths, native modules, or hard dependencies on a list library.

## Setup

```sh
npm install
npm run build-data   # regenerate src/data/emoji-data.ts (committed)
npm run typecheck
npm run prepare      # bob build → lib/
cd example && npm install && npx expo start
```

## PR checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run prepare` (bob build) passes
- [ ] Core stays 100% JS — no native modules, no new hard dependencies
- [ ] List-engine specifics stay inside `src/engines/*`; core only talks to the adapter contract in `src/core/engineContract.ts`
- [ ] Emoji rows remain memoized, stateless, and prop-driven (recycling correctness) — one Pressable per row, cells stay plain Text
- [ ] Rows keep a uniform height; no inline closures passed through the list
- [ ] Dataset changes go through `scripts/build-data.mjs` (never edit `src/data/emoji-data.ts` by hand)
- [ ] Public API changes are reflected in the README props table and exported types
- [ ] Tested in the example app on the New Architecture (FlashList **and** LegendList screens if the change touches the list)

## Reporting bugs

Use the issue templates. Always include: RN / Expo SDK version, engine entry point (`.`, `/legend`, `/flatlist`), and confirmation that the New Architecture is enabled.
