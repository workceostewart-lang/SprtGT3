# Sprt GT3

A browser racing game built from the original Blender circuit and three GT3 concept models.

## Play

- Arrow Up / W: accelerate.
- Arrow Down / S: brake, then reverse.
- Arrow Left / Right or A / D: steer.
- R: recover to your earned position on the track.
- Escape: pause solo / open menu in multiplayer.
- Three laps, six cars. Rookie, Club and Pro change CPU pace and cornering speed.

## Multiplayer

Create a room, share its six-letter code, and have friends open the same game and select Join room. The host starts the race. Up to four humans are supported; CPUs fill the remaining grid slots. The game is available from the Fantomzone catalog at https://fantomzone.app/games/sprt-gt3/.

The host owns physics, race time and lap validation. Guests send inputs and receive state at 20 Hz over WebRTC data channels. Keep the host tab open and visible. There is no host migration or mid-race reconnect. Lost players are marked disconnected after heartbeat timeout. This is casual peer-hosted racing, not a competitive anti-cheat service.

PeerJS Cloud handles signaling. Multiplayer requires internet access and a network permitting WebRTC. Restrictive NAT/firewalls may require a TURN relay, which is not provisioned here. A clear connection error is shown rather than substituting fake players. Solo works without signaling.

## Develop

Node.js 20+:

```
npm install
npm run dev
npm test
npm run build
```

Built assets are in `dist`. Source geometry lives in `public/*.glb`, exported from the Blender files. Meshes are merged by material to reduce draw calls. The 3D cars and circuit are stylized, and driving uses arcade physics with track-edge barriers and gravel slowdown.

## Validation

- Unit tests: closed-circuit projection, countdown lock, acceleration/steering, recovery, start-line handling.
- All six CPUs finish three laps on every difficulty; measured fastest times about 166s / 75s / 64s (Rookie / Club / Pro). Club targets 48 m/s and Pro 52 m/s with less conservative corner braking. All tiers share the player's acceleration and physical speed limit.
- Browser: scene loads, arrow-key acceleration, full HUD and car rendering.
- Two independent browser contexts: create/join room, shared start, guest movement on host, synchronized snapshots.
- Abrupt guest closure: host detects disconnect and removes guest from lobby roster.

Cross-network WebRTC connectivity depends on participants' network configuration and has not been tested across separate physical networks.

## Mobile controls
Hold the left/right virtual arrows with your left thumb and the GAS or BRAKE pedal with your right thumb. Multi-touch supports steering and a pedal simultaneously; releasing a touch, losing focus, or opening the menu clears held controls.

## Publishing
Run `npm run build`, commit and push main, then `npm run deploy` to publish the standalone Cloudflare Worker. Copy `dist` to the Fantomzone repository at `public/games/sprt-gt3`, commit and push the hub, build the hub and run its deploy command. The hub catalog cover is `public/sprt-gt3-cover.png`.
