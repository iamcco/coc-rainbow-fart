/* eslint-disable @typescript-eslint/camelcase */
import assets from './assets';
import { Dispose } from './dispose';
import player from './player';
import { join } from 'path';

let startTime = Date.now();
let lastHour = (() => {
  const date = new Date();
  return date.getHours();
})();

const schedule = {
  $time_morning: '0930',
  $time_before_noon: '1130',
  $time_noon: '1200',
  $time_after_noon: '1400',
  $time_evening: '2100',
  $time_midnight: '2330',
};

let scheduleFlag = {
  $time_morning: false,
  $time_before_noon: false,
  $time_noon: false,
  $time_after_noon: false,
  $time_evening: false,
  $time_midnight: false,
};

export class TimeHook extends Dispose {
  timer: any;

  init() {
    this.timer = setInterval(() => {
      for (const timeName in schedule) {
        const timeString = schedule[timeName];
        if (this.checkTimeString(timeString)) {
          scheduleFlag[timeName] = true;
          // 跳过今天已经过的时间
        }
      }
      const current = new Date();
      if (Date.now() - startTime > 1000 * 60 * 60 * 24) {
        startTime = Date.now();
        scheduleFlag = {
          $time_morning: false,
          $time_before_noon: false,
          $time_noon: false,
          $time_after_noon: false,
          $time_evening: false,
          $time_midnight: false,
        };
      }
      if (lastHour != current.getHours()) {
        lastHour = current.getHours();
        this.playSpecialKeyword('$time_each_hour');
      }
      for (const timeName in schedule) {
        const timeString = schedule[timeName];
        if (this.checkTimeString(timeString) && !scheduleFlag[timeName]) {
          this.playSpecialKeyword(timeName);
          scheduleFlag[timeName] = true;
        }
      }
    }, 10000);
    return this;
  }

  checkTimeString(timeString) {
    const current = new Date();
    const hour = Number(timeString.slice(0, 2));
    const minutes = Number(timeString.slice(2, 4));
    if (current.getHours() >= hour && current.getMinutes() >= minutes) {
      return true;
    } else {
      return false;
    }
  }

  playSpecialKeyword(keyword) {
    const candidate: string[] = [];

    assets.voicePackages.forEach(voicePackage => {
      voicePackage.contributes.forEach(contribute => {
        if (!Array.isArray(contribute.keywords)) {
          contribute.keywords = [contribute.keywords];
        }
        if (contribute.keywords.indexOf(keyword) != -1) {
          if (!Array.isArray(contribute.voices)) {
            contribute.voices = [contribute.voices];
          }
          candidate.push(
            join(voicePackage.path, contribute.voices[Math.floor(contribute.voices.length * Math.random())]),
          );
        }
      });
    });

    if (candidate.length) {
      player.play(candidate[Math.floor(Math.random() * candidate.length)]);
    }
  }

  dispose() {
    super.dispose();
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}

export default new TimeHook();
