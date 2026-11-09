TIMBER STRIKE — MINT PLAY
Mobile-first wooden arcade game

PLAY
Extract the ZIP, then open index.html in Chrome, Edge, Firefox, or Safari.
No Flutter, npm install, server, or build command is needed to play.
The artwork, font, CSS, and JavaScript are embedded in that one file.

Tap Play. Tap the playfield to throw. On a keyboard, Space throws and
Escape pauses. Pause also opens the Workshop. The optional full-screen
control is shown only when the browser supports it.

HOST
The ready-to-upload website is the index.html at the top of this ZIP.
For the simplest GitHub upload, upload that one file to the repository's
root. The game does not depend on any of the other folders to run.
Use that folder as the website's static document root on your host.
No application build command is required.

The optional orbit-pins/index.html file redirects the old game path to
this game. Keep that folder if your app still links to /orbit-pins/.
The source folder is for editing and can be kept separately from hosting.

WHAT IS INCLUDED
- Six painted log designs: oak, birch, cedar, walnut, pine, and ash.
- Ten weapons with different shapes, lengths, and collision outlines.
- One successful hit = one score. Three hearts per run.
- Seven throws on the first log. Difficulty increases with later levels.
- Moving logs, subtle recoil, splinters, rebounding weapons, and random
  textured fragments with gravity. Embedded weapons fall with the wood.
- Continuous levels with no countdown and no level-complete panels.
- Workshop unlocks based on your best score: 0, 5, 12, 20, 30, 45, 60,
  80, 100, and 130. Selection can be changed from the pause menu.
- One free preview revive per run, restoring one heart.
- Reduced-motion support and automatic pause when the page loses focus.
- No sound.

SAVES AND INTEGRATION
Best score and selected weapons are stored in this browser, using
IndexedDB with a localStorage fallback. A run itself is not restored
on reload. Saves do not sync between devices or with the Mint Play app.
Private browsing, cleared site data, or a new website address can reset
local progress. If both storage methods are unavailable, progress lasts
for the current visit only.

This version has no sign-in, real ads, cash rewards, wallet, or backend.
The revive is explicitly a free preview, not an actual ad view.
Old Orbit Space weapon ownership is mapped where the earlier browser
save is available on the same address. Old scores are not imported,
because this game now counts one point per hit.

EDIT THE SOURCE
Readable source is in source/src. The build uses Python's standard
library only; all necessary images and the already-built font are included.
From the source folder, run:

    python build.py

Copy source/dist/index.html over the top-level index.html after building.
No image generation or font tools are required for this build.

Optional gameplay checks, with Node.js installed:

    node qa/core.test.js

The engine tests cover scoring, weapon collisions, fast projectile
collisions, input spam, life loss, revive limits, level progression,
fracture geometry, falling pieces, unlimited play, and difficulty bounds.

ART AND FONT
Art direction and the original generation prompts are in ART-DIRECTION.txt.
The logs/background are included as original generated PNGs under source.
Weapons and interface icons are drawn as vectors in the source.
DejaVu Serif Bold is bundled as a WOFF subset. Its license is included
in FONT-LICENSE.txt and embedded in index.html.
