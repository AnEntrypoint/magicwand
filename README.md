# magicwand

> probably emerging 🌀

nostr + webrtc voice SDK. the networking layer for 247420 projects.

```
npm i magicwand
```

## what it is

serverless nostr relay pool + auth, designed for voice/chat apps that run on public relays with zero backend. extracted from [zellous](https://github.com/AnEntrypoint/zellous). buildless, esm-only, no framework lock-in.

## what's in v0.1

- `RelayPool` — multi-relay connect, subscribe, publish, reconnect with backoff, event dedup, ndk-free
- `NostrAuth` — local-key generation, nsec/hex import, NIP-07 extension login, event signing

WebRTC voice, SFU hub election, channels, chat, servers — landing in subsequent releases. see CHANGELOG.

## usage

```js
import { RelayPool, NostrAuth } from 'magicwand';
import * as NostrTools from 'nostr-tools';

const auth = new NostrAuth({ nostrTools: NostrTools, storage: localStorage });
auth.generateKey();

const pool = new RelayPool({
  relays: ['wss://relay.damus.io', 'wss://nos.lol'],
  verifyEvent: NostrTools.verifyEvent
});
pool.connect();

pool.subscribe('mysub', [{ kinds: [1], limit: 10 }], (event) => {
  console.log('got event', event.id);
});

const signed = await auth.sign({
  kind: 1, created_at: Math.floor(Date.now()/1000), tags: [], content: 'gm'
});
pool.publish(signed);
```

## node usage

```js
import WebSocket from 'ws';
const pool = new RelayPool({ relays: [...], WebSocketImpl: WebSocket });
```

## test

```
npm test
```

hits `wss://relay.damus.io` for a real publish → subscribe round-trip. no mocks.

## peer deps

- `nostr-tools` ^2.7

## license

MIT © AnEntrypoint — read the source.
