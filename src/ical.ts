import ical from 'ical-generator';
import { config } from './config.ts';
import type { Reserve } from './epgstation.ts';

/**
 * 予約タイトルの警告プレフィックスを生成
 *
 * 録画されない予約はタイトル先頭に理由を出す
 */
function statusMark(reserve: Reserve): string {
  if (reserve.isConflict) return '⚠競合 ';
  if (reserve.isOverlap) return '⚠重複 ';
  return '';
}

function buildDescription(reserve: Reserve): string | null {
  const parts = [reserve.description, reserve.extended].filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0,
  );
  return parts.length > 0 ? parts.join('\n\n') : null;
}

/**
 * ICSを生成
 */
export function buildCalendar(reserves: Reserve[], channelNames: Map<number, string>): string {
  const now = new Date();

  const calendar = ical({
    name: config.calendarName,
    prodId: { company: 'epgstation-ical', product: 'epgstation-ical', language: 'JA' },
    // クライアントへの取得間隔のヒント(10分)
    ttl: 600,
  });

  for (const reserve of reserves) {
    // 手動で無効化された予約は録画されないので出さない
    if (reserve.isSkip) continue;

    const channelName = channelNames.get(reserve.channelId) ?? `channel:${reserve.channelId}`;

    calendar.createEvent({
      id: `${reserve.id}@epgstation-ical`,
      start: new Date(reserve.startAt),
      end: new Date(reserve.endAt),
      stamp: now,
      lastModified: now,
      summary: `${statusMark(reserve)}[${channelName}] ${reserve.name}`,
      description: buildDescription(reserve),
    });
  }

  return calendar.toString();
}
