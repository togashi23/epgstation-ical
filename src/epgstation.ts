import { config } from './config.ts';

/** 予約情報(使用するフィールドのみ定義) */
export interface Reserve {
  id: number;
  name: string;
  description?: string;
  extended?: string;
  startAt: number;
  endAt: number;
  channelId: number;
  programId?: number;
  ruleId?: number;
  isSkip: boolean;
  isConflict: boolean;
  isOverlap: boolean;
}

export interface Channel {
  id: number;
  name: string;
  halfWidthName: string;
}

interface ReservesResponse {
  reserves: Reserve[];
  total: number;
}

/** 1ページあたりの取得件数 */
const PAGE_SIZE = 100;
/** 最大ページ数 */
const MAX_PAGES = 100;

async function getJson<T>(path: string): Promise<T> {
  const url = `${config.apiUrl}${path}`;
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`EPGStationが${response.status}を返しました: ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * 予約を全件取得
 */
export async function fetchAllReserves(): Promise<Reserve[]> {
  const reserves: Reserve[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const query = new URLSearchParams({
      isHalfWidth: String(config.halfWidth),
      type: 'all',
      limit: String(PAGE_SIZE),
      offset: String(reserves.length),
    });
    const body = await getJson<ReservesResponse>(`/api/reserves?${query}`);
    reserves.push(...body.reserves);

    if (body.reserves.length === 0 || reserves.length >= body.total) {
      return reserves;
    }
  }

  throw new Error(`予約の取得が${MAX_PAGES}ページの上限に達しました`);
}

export async function fetchChannels(): Promise<Channel[]> {
  return getJson<Channel[]>('/api/channels');
}
