import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { config } from './config.ts';
import { getChannelNames } from './channels.ts';
import { fetchAllReserves } from './epgstation.ts';
import { buildCalendar } from './ical.ts';

const CALENDAR_PATH = '/reserves.ics';

function send(res: ServerResponse, status: number, contentType: string, body: string, head: boolean): void {
  const buffer = Buffer.from(body, 'utf8');
  res.writeHead(status, {
    'content-type': contentType,
    'content-length': buffer.byteLength,
    'cache-control': 'no-cache',
  });
  res.end(head ? undefined : buffer);
}

async function handleCalendar(res: ServerResponse, head: boolean): Promise<void> {
  try {
    const [reserves, channelNames] = await Promise.all([fetchAllReserves(), getChannelNames()]);
    const body = buildCalendar(reserves, channelNames);
    send(res, 200, 'text/calendar; charset=utf-8', body, head);
  } catch (error) {
    // 空のカレンダーを200で返すとクライアントは「全予約が消えた」と解釈して
    // カレンダーから予定を消してしまう。必ずエラーを返し、前回の内容を保持させる。
    console.error('[error]予約の取得に失敗しました:', error);
    send(res, 502, 'text/plain; charset=utf-8', 'EPGStationから予約を取得できませんでした\n', head);
  }
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const method = req.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    send(res, 405, 'text/plain; charset=utf-8', 'method not allowed\n', false);
    return;
  }

  const head = method === 'HEAD';
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;

  if (pathname === '/healthz') {
    send(res, 200, 'text/plain; charset=utf-8', 'ok\n', head);
    return;
  }

  if (pathname === CALENDAR_PATH) {
    void handleCalendar(res, head);
    return;
  }

  send(res, 404, 'text/plain; charset=utf-8', 'not found\n', head);
});

server.listen(config.listenPort, () => {
  console.log(`[info] epgstation-icalを起動しました: http://0.0.0.0:${config.listenPort}${CALENDAR_PATH}`);
  console.log(`[info] EPGStation API: ${config.apiUrl}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
