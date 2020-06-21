import { logger } from './logger';
import { readFile, glob } from './utils';
import { Dispose } from './dispose';
import settings from './settings';

const log = logger.getLog('assets');

const requiredProperties = ['name', 'version', 'contributes'];

export interface VoicePackage {
  enabled: boolean;
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
    voices: string[];
  }>;
}

export class Assets extends Dispose {
  voicePackages: VoicePackage[] = [];

  async init() {
    this.voicePackages = [];
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
    const isValid = requiredProperties.every(field => {
      if (!config[field]) {
        log(`Voice package ${voicePackagePath} require include ${field} field`);
        return false;
      }
      return true;
    });

    isValid &&
      this.voicePackages.push({
        ...config,
        path: voicePackagePath,
      });
  }

  dispose() {
    this.voicePackages = [];
  }
}

export default new Assets();
