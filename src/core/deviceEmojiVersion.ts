import { Platform } from 'react-native';
import { DATA_CATEGORY_ORDER, getEmojisForCategory } from './data';

function iosAtLeast(maj: number, targetMaj: number, min: number, targetMin: number): boolean {
  return maj > targetMaj || (maj === targetMaj && min >= targetMin);
}

/**
 * Highest Unicode Emoji version this device is known to render, or null for
 * "everything in the dataset".
 *
 * iOS ships new emoji in OS point releases (glyph tables per emojipedia).
 * Android is capped at the version its release shipped with. Newer glyphs
 * can arrive through Play system updates or OEM fonts, but whether they did
 * varies by device — {@link getDeviceEmojiSupport} asks the font instead
 * when the native module is linked.
 */
export function detectMaxEmojiVersion(): number | null {
  if (Platform.OS === 'ios') {
    const parts = String(Platform.Version).split('.');
    const maj = parseInt(parts[0] ?? '0', 10) || 0;
    const min = parseInt(parts[1] ?? '0', 10) || 0;
    if (iosAtLeast(maj, 26, min, 4)) return null; // Emoji 17
    if (iosAtLeast(maj, 18, min, 4)) return 16;
    if (iosAtLeast(maj, 17, min, 4)) return 15.1;
    if (iosAtLeast(maj, 16, min, 4)) return 15;
    if (iosAtLeast(maj, 15, min, 4)) return 14;
    if (iosAtLeast(maj, 14, min, 2)) return 13;
    return 12;
  }
  if (Platform.OS === 'android') {
    const api =
      typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10) || 0;
    if (api >= 36) return 16;
    if (api >= 35) return 15.1;
    if (api >= 34) return 15;
    if (api >= 33) return 14;
    if (api >= 31) return 13.1;
    if (api >= 30) return 13;
    if (api >= 29) return 12;
    return 11;
  }
  return null;
}

/** Resolved once at module load — Platform.Version never changes at runtime. */
export const DEVICE_MAX_EMOJI_VERSION = detectMaxEmojiVersion();

export interface DeviceEmojiSupport {
  maxVersion: number | null;
  /** Glyphs the device font can't draw, once the font has been asked. */
  unsupported: ReadonlySet<string> | null;
}

// Every Android release React Native supports (API 24+) draws Emoji 5.0,
// so only newer emoji are worth asking the font about.
const ANDROID_PROBE_ABOVE = 5;

interface EmojiRowModule {
  missingGlyphs?: (glyphs: string[]) => Promise<string[]>;
}

let support: DeviceEmojiSupport = {
  maxVersion: DEVICE_MAX_EMOJI_VERSION,
  unsupported: null,
};
const listeners = new Set<() => void>();

/**
 * On Android with the native module linked, asks the device font about each
 * emoji newer than 5.0 (Paint.hasGlyph, the check EmojiCompat uses), which
 * catches OEM fonts that lag or lead the OS version. Started at import on a
 * native background thread so no picker mount ever waits for it; until it
 * answers, the OS table applies.
 */
function probeDeviceFont() {
  if (Platform.OS !== 'android') return;
  // Read straight off the Expo modules host object so the JS-only entry
  // points don't have to import expo-modules-core (an optional peer).
  const mod: EmojiRowModule | undefined = (globalThis as any).expo?.modules
    ?.RNExpoEmojiRow;
  if (typeof mod?.missingGlyphs !== 'function') return;
  const candidates = DATA_CATEGORY_ORDER.flatMap((key) =>
    getEmojisForCategory(key)
      .filter((e) => e.version > ANDROID_PROBE_ABOVE)
      .map((e) => e.emoji)
  );
  mod
    .missingGlyphs(candidates)
    .then((missing) => {
      support = { maxVersion: null, unsupported: new Set(missing) };
      listeners.forEach((l) => l());
    })
    .catch(() => {
      // Keep the OS-table answer.
    });
}

probeDeviceFont();

export function getDeviceEmojiSupport(): DeviceEmojiSupport {
  return support;
}

export function subscribeDeviceEmojiSupport(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
