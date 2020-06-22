import { listManager } from 'coc.nvim';
import { Dispose } from '../dispose';
import { VoicePackages } from './voice-packages';

export class Sources extends Dispose {
  constructor() {
    super();
    this.push(listManager.registerList(new VoicePackages()));
  }
}
