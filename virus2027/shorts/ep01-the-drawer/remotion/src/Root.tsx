import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './theme';
import {Timing, Transmission, totalFrames} from './Transmission';
import en from './data/timing_en.json';
import ru from './data/timing_ru.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TransmissionEN"
      component={Transmission as never}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={totalFrames(en as Timing)}
      defaultProps={{timing: en as Timing, audio: 'vo_en.wav'}}
    />
    <Composition
      id="TransmissionRU"
      component={Transmission as never}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={totalFrames(ru as Timing)}
      defaultProps={{timing: ru as Timing, audio: 'vo_ru.wav'}}
    />
  </>
);
