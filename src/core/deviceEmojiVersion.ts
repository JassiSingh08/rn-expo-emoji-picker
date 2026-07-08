import { Platform } from 'react-native';

function iosAtLeast(maj: number, targetMaj: number, min: number, targetMin: number): boolean {
  return maj > targetMaj || (maj === targetMaj && min >= targetMin);
}

/**
 * Highest Unicode Emoji version this device is known to render, or null for
 * "everything in the dataset".
 *
 * iOS ships new emoji in OS point releases (glyph tables per emojipedia).
 * Android 12+ (API 31) receives NotoColorEmoji through Google Play system
 * updates decoupled from the OS, so it is assumed current; older API levels
 * are capped at the font their release shipped with.
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
    if (api >= 31) return null;
    if (api >= 30) return 13;
    if (api >= 29) return 12;
    return 11;
  }
  return null;
}

/** Resolved once at module load — Platform.Version never changes at runtime. */
export const DEVICE_MAX_EMOJI_VERSION = detectMaxEmojiVersion();
