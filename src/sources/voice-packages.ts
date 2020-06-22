import { IList, ListAction, ListItem, workspace } from 'coc.nvim';
import colors from 'colors/safe';
import assets, { requiredProperties } from '../assets';
import settings from '../settings';

export class VoicePackages implements IList {
  public readonly name = 'VoicePackages';
  public readonly description = 'Rainbow-fart voice package list';
  public readonly defaultAction = 'Enable';
  public actions: ListAction[] = [];

  constructor() {
    this.actions.push({
      name: 'Enable',
      reload: true,
      multiple: true,
      persist: true,
      execute: async item => {
        const items = ([] as ListItem[]).concat(item);
        const config = workspace.getConfiguration('rainbow-fart');
        const disabledVoicePackages = config.get<string[]>('disable-voice-packages', []);
        const newDisabledVoicePackages: string[] = disabledVoicePackages.filter(name => {
          return items.some(p => p.data && p.data.name !== name);
        });
        config.update('disable-voice-packages', newDisabledVoicePackages, true);
      },
    });
    this.actions.push({
      name: 'Disable',
      reload: true,
      persist: true,
      multiple: true,
      execute: async item => {
        const items = ([] as ListItem[]).concat(item);
        const config = workspace.getConfiguration('rainbow-fart');
        const disabledVoicePackages = config.get<string[]>('disable-voice-packages', []);
        const newDisabledVoicePackages: string[] = items
          .filter(p => {
            return (
              disabledVoicePackages.length === 0 || disabledVoicePackages.some(name => p.data && p.data.name !== name)
            );
          })
          .map(p => p.data.name);
        config.update('disable-voice-packages', disabledVoicePackages.concat(newDisabledVoicePackages).sort(), true);
      },
    });
  }

  public async loadItems(): Promise<ListItem[]> {
    return assets.allVoicePackages.map<ListItem>(p => {
      const isValid = requiredProperties.every(field => {
        return p[field] !== undefined;
      });
      const validField = `Valid:${isValid ? '✅' : '🚫'}`.padEnd(10, ' ');
      const enabledField = `Enabled:${isValid && !settings.isVoicePackageDisabled(p.name) ? '✅' : '🚫'}  `;
      const authorField = `${p.author || 'UnKnow'}`.padEnd(20, ' ');
      const localeField = `${p.locale}`.padEnd(4, ' ');
      const versionField = (p.version || '').padEnd(10, ' ');
      const nameField = colors.yellow(p['display-name'] || p.name);
      return {
        label: `${validField}${enabledField}${authorField}${localeField}${versionField}${nameField}`,
        data: p,
      };
    });
  }
}
