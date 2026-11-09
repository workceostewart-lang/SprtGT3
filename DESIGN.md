# Apex Raceway design lock
The user's existing Blender circuit and three car renders are the dominant visual reference. Reuse the actual mesh, track silhouette, red/white curbs, pit complex, sand and stands. This is a direct build, not a redesign.

Refero bundled references reviewed: craft-details.md and color.md. Apply semantic native controls, visible keyboard focus, accessible status messages and restrained color roles. The full-screen track is the main image; no invented marketing page.

Decision ledger:
- Scene: original raceway.blend; export real geometry and reduce draw calls by material.
- Interface: charcoal translucent timing panels, white numerals, red primary race action. Derived from track materials; color reserved for driver identity and warnings.
- Journey: car and difficulty -> solo race, or create/join room -> roster -> host starts -> countdown -> 3 laps -> results/rematch.
- HUD: lap/position top left, timing top right, map bottom left, speed bottom right; keep driving sightline clear.
- Typography: system sans headings, tabular monospace race numbers, readable labels.
- Input: arrow keys/WASD, R recovery, Esc pause (solo only), touch controls, focus-visible outlines.

Multiplayer architecture: PeerJS signaling with WebRTC data channels; host owns fixed-step physics, lap validation, CPU and race clock. Guests send input only. Rooms support four humans; CPUs fill a six-car grid. Host must remain open. Clear errors for lost host, full room, unavailable signaling, and connection timeout.
