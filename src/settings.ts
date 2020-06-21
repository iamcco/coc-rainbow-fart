import path from 'path';
import { workspace, ExtensionContext } from 'coc.nvim';

import { Dispose } from './dispose';
import { glob } from './utils';
import { logger } from './logger';

const log = logger.getLog('settings');

class Settings extends Dispose {
  private builtInVoicePackages: string[] = [];
  private disableVoicePackages: Record<string, boolean> = {};

  async init(context: ExtensionContext) {
    const packagesPath = path.resolve(context.extensionPath, 'built-in-voice-packages');
    try {
      const voicePackages = await glob('*', packagesPath);
      if (voicePackages) {
        this.builtInVoicePackages.push(...voicePackages);
      }
    } catch (error) {
      log(error);
    }
    this.loadDisabledVoicePackages();
    this.push(
      workspace.onDidChangeConfiguration(() => {
        this.loadDisabledVoicePackages();
      }),
    );
    return this;
  }

  loadDisabledVoicePackages() {
    this.disableVoicePackages = {};
    const config = workspace.getConfiguration('rainbow-fart');
    const voicePackages = config.get<string[]>('disable-voice-packages', []);
    voicePackages.forEach(name => {
      this.disableVoicePackages[name] = true;
    });
  }

  get voicePackages() {
    const config = workspace.getConfiguration('rainbow-fart');
    const voicePackages = config.get<string[]>('voice-packages', []);
    return this.builtInVoicePackages.concat(voicePackages);
  }

  isVoicePackageDisabled(name: string) {
    return this.disableVoicePackages[name];
  }

  dispose() {
    super.dispose();
    this.builtInVoicePackages = [];
  }
}

export default new Settings();
