import { ExtensionContext, workspace } from 'coc.nvim';

import settings from './settings';
import assets from './assets';
import commands from './commands';
import timerHook from './timerHook';
import inputHook from './inputHook';
import { Dispose } from './dispose';
import player from './player';
import { logger, logLevel } from './logger';

export class App extends Dispose {
  isEnabled = false;
  private context: ExtensionContext | undefined;

  init(context: ExtensionContext) {
    this.context = context;
    const config = workspace.getConfiguration('rainbow-fart');
    const enabled = config.get<boolean>('enabled', true);
    this.push(logger.init(config.get<logLevel>('trace.server', 'off')));
    if (!enabled) {
      return this;
    }
    this.load();
    return this;
  }

  async load() {
    if (this.isEnabled) {
      return;
    }
    this.isEnabled = true;
    this.push(commands.init());
    this.push(await player.init(this.context!));
    this.push(await settings.init(this.context!));
    this.push(await assets.init());
    this.push(timerHook.init());
    this.push(inputHook.init());
  }
}

export default new App();
