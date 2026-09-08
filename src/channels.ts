import { config } from './config.ts';
import { fetchChannels } from './epgstation.ts';

interface ChannelCache {
  fetchedAt: number;
  names: Map<number, string>;
}

let cache: ChannelCache | undefined;

/**
 * channelId -> チャンネル名の対応表を返却
 *
 * @description 予約データにチャンネル名は含まれないため別途取得が必要だが、ほぼ変化しないのでTTL付きでプロセス内にキャッシュする。
 */
export async function getChannelNames(): Promise<Map<number, string>> {
  if (cache && Date.now() - cache.fetchedAt < config.channelCacheTtlMs) {
    return cache.names;
  }

  const channels = await fetchChannels();
  const names = new Map<number, string>(
    channels.map((channel) => [
      channel.id,
      (config.halfWidth ? channel.halfWidthName : channel.name) || channel.name,
    ]),
  );

  cache = { fetchedAt: Date.now(), names };
  return names;
}
