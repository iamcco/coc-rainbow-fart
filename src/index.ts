import { ExtensionContext } from 'coc.nvim';

import app from './app';

export async function activate(context: ExtensionContext) {
  context.subscriptions.push(app.init(context));
}
