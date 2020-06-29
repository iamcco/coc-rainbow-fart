import { logger } from './logger';
import { readFile, glob } from './utils';
import { Dispose } from './dispose';
import settings from './settings';
import { workspace } from 'coc.nvim';

const log = logger.getLog('assets');

export const requiredProperties = ['name', 'version', 'contributes'];

export interface VoicePackage {
  name: string;
  'display-name': string;
  avatar: string;
  'avatar-dark': string;
  version: string;
  description: string;
  languages: ['javascript'];
  author: string;
  gender: string;
  locale: string;
  path: string;
  contributes: Array<{
    keywords: string[];
    regexps: string[];
    voices: string[];
  }>;
}

export class Assets extends Dispose {
  private _voicePackages: VoicePackage[] = [];

  get voicePackages() {
    const cfg = workspace.getConfiguration('rainbow-fart');
    const locale = cfg.get<string[]>('locale', ['zh']);
    return this._voicePackages.filter(p => {
      const isValid = requiredProperties.every(field => {
        return p[field] !== undefined;
      });
      return isValid && locale.indexOf(p.locale) !== -1 && !settings.isVoicePackageDisabled(p.name);
    });
  }

  get allVoicePackages() {
    return this._voicePackages.slice(0);
  }

  async init() {
    this._voicePackages = [];
    const voicePackages = settings.voicePackages;

    for (const voicePackagePath of voicePackages) {
      await this.loadPackage(voicePackagePath);
    }
    return this;
  }

  async loadPackage(voicePackagePath: string) {
    let files: string[] = [];
    try {
      files = await glob('*.json', voicePackagePath);
    } catch (error) {
      log(error);
    }
    let config = {} as VoicePackage;
    for (const filePath of files) {
      try {
        const fileContent = await readFile(filePath);
        config = Object.assign(config, JSON.parse(fileContent.toString()));
      } catch (e) {
        log(e);
      }
    }
    requiredProperties.every(field => {
      if (!config[field]) {
        log(`Voice package ${voicePackagePath} require include ${field} field`);
        return false;
      }
      return true;
    });

    this._voicePackages.push({
      ...config,
      path: voicePackagePath,
    });
  }

  dispose() {
    this._voicePackages = [];
  }
}

export default new Assets();
