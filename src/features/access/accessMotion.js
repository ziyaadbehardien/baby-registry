/**
 * Motion for the passphrase screen, adapted from a Dribbble login concept:
 *  - intro: a pale cover with a blue band sweeping left → right to reveal the page, the artwork
 *    settling from a slight zoom, then the form rising in item by item;
 *  - sign-in: a thin progress line, then a blue curtain dropping from the top with a welcome
 *    message, which lifts away once the app has loaded.
 * Everything is CSS keyframes; visitors who prefer reduced motion get none of it.
 */
import { keyframes } from '@emotion/react';
import { useMediaQuery } from '@mui/material';

import { tones } from 'assets/theme';

export const MOTION = {
  coverColor: tones.primary[90],
  bandColor: tones.primary[60],
  curtainColor: tones.primary[80],
  curtainText: tones.primary[10],
  ease: 'cubic-bezier(0.65, 0, 0.35, 1)',
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  introMs: 1100,
  curtainMs: 650,
  welcomeHoldMs: 700,
};

// Band + cover move together: the band leads, so content is revealed behind its trailing edge.
export const sweepAcross = keyframes`
  from { transform: translateX(-35vw); }
  to   { transform: translateX(100vw); }
`;

export const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

export const settleZoom = keyframes`
  from { transform: scale(1.08); }
  to   { transform: scale(1); }
`;

export const riseIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const dropDown = keyframes`
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
`;

export const liftAway = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(-100%); }
`;

export const shake = keyframes`
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
`;

export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });
