import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Fonts are self-hosted rather than pulled through @remotion/google-fonts.
 *
 * The render runs in a headless Chrome behind an inspecting proxy whose CA
 * the browser does not trust, so every request to fonts.gstatic.com dies on
 * ERR_CERT_AUTHORITY_INVALID and takes the render down with it. Shipping the
 * five woff2 files in public/ removes the network from the render path
 * entirely, which is the right answer regardless of the proxy: a film that
 * needs the internet to typeset itself is not reproducible.
 *
 * This has to be a hook, not a module-scope side effect. `delayRender`
 * outside a render throws, and the bundler evaluates every module once
 * before any composition mounts — so loading fonts at import time fails the
 * render before a frame is drawn, which is exactly the trap the first
 * version of this file fell into.
 */
const FACES: Array<[string, number, string]> = [
  ['Barlow Condensed', 600, 'barlow-condensed-600.woff2'],
  ['Barlow Condensed', 700, 'barlow-condensed-700.woff2'],
  ['Barlow Condensed', 800, 'barlow-condensed-800.woff2'],
  ['IBM Plex Mono', 400, 'ibm-plex-mono-400.woff2'],
  ['IBM Plex Mono', 500, 'ibm-plex-mono-500.woff2'],
];

export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender('self-hosted fonts'));

  useEffect(() => {
    let live = true;
    Promise.all(
      FACES.map(([family, weight, file]) =>
        new FontFace(
          family,
          `url(${staticFile(`fonts/${file}`)}) format('woff2')`,
          {weight: String(weight), style: 'normal', display: 'block'},
        )
          .load()
          .then((face) => {
            // The lib.dom bundled with this toolchain types FontFaceSet
            // without add(); it exists in every browser that has FontFace
            // at all, so the cast is safe and narrower than widening the
            // whole compiler target.
            (document.fonts as unknown as {add: (f: FontFace) => void})
              .add(face);
          }),
      ),
    )
      // A missing face must not hang the render — falling back to Arial
      // Narrow is bad, but a render that never finishes is worse.
      .catch(() => undefined)
      .then(() => {
        if (live) {
          continueRender(handle);
        }
      });
    return () => {
      live = false;
    };
  }, [handle]);
};
