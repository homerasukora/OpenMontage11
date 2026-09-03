import React from 'react';
import {Composition} from 'remotion';
import {DURATION, Sting} from './Sting';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Sting"
    component={Sting}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
