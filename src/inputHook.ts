import { workspace } from 'coc.nvim';
import assets from './assets';
import { Dispose } from './dispose';
import player from './player';
import { join } from 'path';

export class InputHook extends Dispose {
  inputHistory = '';

  init() {
    this.push(
      workspace.onDidChangeTextDocument(evt => {
        evt.contentChanges.forEach(change => {
          if (change.text.length > 30) {
            // Some user may enabled the `format on save`, that will also cause `onDidChangeTextDocument` event.
            // So, If contents are too large, it's may not a keyword.
            return;
          }
          this.inputHistory += change.text;
          if (this.inputHistory.replace(/\s/g, '').length > 100) {
            this.inputHistory = this.inputHistory.slice(this.inputHistory.length - 100 - 1);
          }
          try {
            this.keywordsCheck();
          } catch (e) {
            console.error(e);
          }
        });
      }),
    );
    return this;
  }

  keywordsCheck() {
    const candidate: string[] = [];

    assets.voicePackages.forEach(voicePackage => {
      voicePackage.contributes.forEach(contribute => {
        if (!Array.isArray(contribute.keywords)) {
          contribute.keywords = [contribute.keywords];
        }
        contribute.keywords.forEach(keyword => {
          if (this.inputHistory.indexOf(keyword) != -1) {
            if (!Array.isArray(contribute.voices)) {
              contribute.voices = [contribute.voices];
            }
            candidate.push(
              join(voicePackage.path, contribute.voices[Math.floor(contribute.voices.length * Math.random())]),
            );
          }
        });
      });
    });

    if (candidate.length) {
      this.inputHistory = '';
      player.play(candidate[Math.floor(Math.random() * candidate.length)]);
    }
  }
}

export default new InputHook();
