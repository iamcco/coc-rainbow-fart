import { OutputChannel, workspace } from 'coc.nvim';
import { Dispose } from './dispose';

export type logLevel = 'off' | 'messages' | 'verbose';

class Logger extends Dispose {
  private _channel: OutputChannel | undefined;
  private _traceServer: logLevel | undefined;

  init(level: logLevel) {
    this._traceServer = level;
    if (this._traceServer !== 'off') {
      this._channel = workspace.createOutputChannel('rainbow-fart');
      this.push(this._channel);
    }
    return this;
  }

  set channel(channel: OutputChannel | undefined) {
    this._channel = channel;
  }

  get channel(): OutputChannel | undefined {
    return this._channel;
  }

  get traceServer(): logLevel | undefined {
    return this._traceServer;
  }

  getLog(name: string): (message: string | undefined) => void {
    return (message: string | undefined) => {
      message && this._channel && this._channel.appendLine(`[${name}]: ${message}`);
    };
  }

  dispose() {
    super.dispose();
    this._channel = undefined;
    this._traceServer = undefined;
  }
}

export const logger = new Logger();
