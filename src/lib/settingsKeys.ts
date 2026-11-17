import type { AppSettings } from './types';

export const SETTING_KEYS = {
  remindersEnabled: 'remindersEnabled',
} as const satisfies Record<keyof AppSettings, string>;

export const DEFAULT_SETTINGS: AppSettings = {
  remindersEnabled: false,
};
