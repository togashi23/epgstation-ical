const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`環境変数${name}が設定されていません`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function integer(name: string, fallback: number): number {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`環境変数${name}には正の整数を指定してください: ${value}`);
  }
  return parsed;
}

function boolean(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(value)) return true;
  if (['0', 'false', 'no', 'off'].includes(value)) return false;
  throw new Error(`環境変数${name}にはtrue/falseを指定してください: ${value}`);
}

const apiUrl = stripTrailingSlash(required('EPGSTATION_URL'));

export const config = {
  /** EPGStationのAPI URL */
  apiUrl,
  /** 待ち受けポート */
  listenPort: integer('LISTEN_PORT', 3000),
  /** カレンダー名 */
  calendarName: optional('CALENDAR_NAME', 'epgstation reserved'),
  /** チャンネル一覧のキャッシュ保持時間(ミリ秒) */
  channelCacheTtlMs: integer('CHANNEL_CACHE_TTL', 3600) * 1000,
  /** 番組名・チャンネル名を半角に正規化するか */
  halfWidth: boolean('HALF_WIDTH', true),
  /** EPGStationのリクエストタイムアウト(ミリ秒) */
  requestTimeoutMs: integer('REQUEST_TIMEOUT', 10) * 1000,
} as const;
