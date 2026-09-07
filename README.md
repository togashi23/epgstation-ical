# epgstation-ical

EPGStationの録画予約をiCalendar (ICS)で配信します。

## エンドポイント

| パス | 内容 |
| --- | --- |
| `GET /reserves.ics` | 録画予約のカレンダー |
| `GET /healthz` | 死活確認 |

## セットアップ

```sh
cp .env.example .env
# .envのEPGSTATION_URLを自分のEPGStationに合わせる
docker compose up -d --build
```

`http://<ホスト名>:3000/reserves.ics`を各カレンダーアプリで購読してください。

## 環境変数

| 変数 | 既定値 | 説明 |
| --- | --- | --- |
| `EPGSTATION_URL` | (必須) | EPGStationのAPI URL |
| `LISTEN_PORT` | `3000` | 待ち受けポート |
| `CALENDAR_NAME` | `epgstation reserved` | カレンダー名(`X-WR-CALNAME`) |
| `CHANNEL_CACHE_TTL` | `3600` | チャンネル一覧のキャッシュ保持時間(秒) |
| `HALF_WIDTH` | `true` | 番組名・チャンネル名を半角に正規化するか |
| `REQUEST_TIMEOUT` | `10` | EPGStationへの1リクエストのタイムアウト(秒) |

## 開発

```sh
npm install
npm run typecheck

# Bash
EPGSTATION_URL=http://192.168.100.14:8888/ npm run dev

# PowerShell
$env:EPGSTATION_URL='http://192.168.100.14:8888/'; npm run dev

# cmd
set EPGSTATION_URL=http://192.168.100.14:8888/ && npm run dev
```
