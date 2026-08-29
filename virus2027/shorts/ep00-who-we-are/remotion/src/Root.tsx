import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './theme';
import {Timing, Transmission, totalFrames} from './Transmission';
import en from './data/timing_en.json';
import beats from './data/beats.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TransmissionEN"
    component={Transmission as never}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={totalFrames(en as Timing)}
    defaultProps={{timing: en as Timing, beats: beats as never, audio: 'mix_en.wav'}}
  />
);
