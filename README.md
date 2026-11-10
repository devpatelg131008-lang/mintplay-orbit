# Timber Strike — GitHub + Vercel

## Upload to GitHub

1. Extract the outer ZIP.
2. Open your GitHub repository, then **Add file → Upload files**.
3. Select `index.html`, `vercel.json`, and this `README.md` from the extracted folder. Commit the upload.
4. You should immediately see `index.html` and `vercel.json` on the repository's first page, without opening another folder.

`Editable-Source.zip` is an optional copy of the complete editable source. Keep it on your computer. You do not need to extract or upload it to deploy the game.

## Import into Vercel

Import this GitHub repository as a project. Use these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Repository root (leave the default; do not choose `source`) |
| Build Command | Empty |
| Install Command | Empty |
| Output Directory | `.` |

The included `vercel.json` sets the framework, build, install, and output settings. The Root Directory must still point to the folder containing both `index.html` and `vercel.json`.

Deploy, wait for Ready, then open the deployment's Visit link on your phone.

## If you are updating an existing Vercel project

Check **Settings → Build and Deployment → Root Directory** first. If the files are at the repository root, clear any old subfolder selection. If you intentionally put the files inside a folder, select that exact folder instead. Save, then redeploy the latest commit.

The outer ZIP itself is not a website. Upload the files inside it. This game needs no Flutter, npm, Python, or build command for deployment.

## Included game

The complete working game, art, font, and scripts are embedded in `index.html`. The `/orbit-pins/` path is also supported by the Vercel configuration. Opening `index.html` locally still works. Saves remain browser-local.

This update includes immediate rapid-fire tapping, faster arrows, larger logs, twelve painted log designs, expressive faces, and weapons that settle one quarter of their length into the wood. Direction reversals begin at level 10 and become more frequent at level 15. Leaves fall after every tenth completed level. Sound effects have a persistent mute switch. The home screen and ten-weapon Workshop are retained, with a redesigned game-over board.

There is no play timer. Each successful hit adds one point. Runs start with three hearts and allow one free revive. Real ads, account sync, and cash rewards are not connected in this version.

Your best score, unlocked weapons, selected weapon, and sound preference stay on the same browser and website address. Replacing these files on the same deployment preserves those saves. Clearing browser data, private browsing, or changing the website address can reset them.

## Verification and troubleshooting

This package's layout and configuration have been checked locally. It has not been deployed to your Vercel account. A 404 can also come from a wrong deployment URL or project settings. If it persists, share the Vercel URL and a screenshot of the build settings so the exact cause can be checked.

Official reference: https://vercel.com/docs/builds/configure-a-build
