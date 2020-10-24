import { CommandStateResolver } from '../../models/commands';
import {
  buildKeyboard,
  IPrefsContext,
  keyboardResponseText,
  chooseState
} from './common/prefs';

export const prefsCommand: CommandStateResolver<'prefs'> = {
  INITIAL: async (client) => {

    const { context, currentUser } = client.getCurrentState<IPrefsContext>();
    context.interests = currentUser.interests;
    context.isRegistering = false;

    const keyboard = buildKeyboard(context);
    client.sendMessage(keyboardResponseText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

    return 'CHOOSING' as const;
  },
  CHOOSING: (client, arg, originalArg) =>
    chooseState(client, arg, originalArg, 'CHOOSING', 'END') as any
};
