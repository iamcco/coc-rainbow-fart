import { workspace, ExtensionContext } from 'coc.nvim';
import os from 'os';
import { Dispose } from './dispose';
import { join } from 'path';

import { exists, mkdirs } from './utils';
import { download } from './download';
import { logger } from './logger';
import { spawn } from 'child_process';

const log = logger.getLog('play');

const ffplayUrls = {
  darwin: ['https://github.com/vot/ffbinaries-prebuilt/releases/download/v3.2/ffplay-3.2-osx-64.zip', 'ffplay'],
  linux: ['https://github.com/vot/ffbinaries-prebuilt/releases/download/v3.2/ffplay-3.2.2-linux-32.zip', 'ffplay'],
  win32: ['https://github.com/vot/ffbinaries-prebuilt/releases/download/v3.2/ffplay-3.2-win-32.zip', 'ffplay.exe'],
};

class Player extends Dispose {
  cmd = '';
  isPlaying = false;

  async init(context: ExtensionContext) {
    const dataPath = context.storagePath;
    let isExists = await exists(dataPath);
    const platform = ffplayUrls[os.platform()];
    if (!platform) {
      workspace.showMessage('Your platform is not supported by now!');
    }
    if (!isExists) {
      await mkdirs(dataPath);
    }
    const cmd = join(dataPath, platform[1]);
    isExists = await exists(cmd);

    if (!isExists) {
      try {
        log(`${cmd} ${platform[0]} ${platform[1]}`);
        await download(cmd, platform[0], platform[1]);
        this.cmd = cmd;
      } catch (error) {
        log(`download error ${error}`);
      }
    }
    this.cmd = cmd;
    return this;
  }

  play(path: string) {
    log(`play ${path}`);
    if (path && this.cmd && !this.isPlaying) {
      this.isPlaying = true;
      spawn(this.cmd, ['-vn', '-v', 'error', '-nodisp', '-autoexit', path]).on('exit', () => {
        this.isPlaying = false;
      });
    }
  }
}

export default new Player();
