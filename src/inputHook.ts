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
        let triggered = false;
        const keywords = ([] as string[]).concat(contribute.keywords || ([] as string[]));
        keywords.some(keyword => {
          if (this.inputHistory.indexOf(keyword) !== -1) {
            triggered = true;
            return true;
          }
          return false;
        });
        // check regex when not triggered
        if (!triggered) {
          const regexps = ([] as string[]).concat(contribute.regexps || ([] as string[]));
          regexps.forEach(regexp => {
            if (RegExp(regexp).test(this.inputHistory)) {
              triggered = true;
              return true;
            }
            return false;
          });
        }
        if (triggered) {
          const voices = ([] as string[]).concat(contribute.voices);
          candidate.push(join(voicePackage.path, voices[Math.floor(voices.length * Math.random())]));
        }
      });
    });

    if (candidate.length) {
      this.inputHistory = '';
      player.play(candidate[Math.floor(Math.random() * candidate.length)]);
    }
  }
}

export default new InputHook();
