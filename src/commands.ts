import { commands } from 'coc.nvim';

import { Dispose } from './dispose';
import app from './app';

class Commands extends Dispose {
  init() {
    this.push(
      commands.registerCommand('rainbow-fart.enable', function() {
        app.load();
      }),
    );
    return this;
  }
}

export default new Commands();
