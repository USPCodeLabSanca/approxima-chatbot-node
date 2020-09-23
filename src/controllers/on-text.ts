import TelegramBot from 'node-telegram-bot-api';
import {
  commands,
  Command,
} from '../models/commands';
import { runCommand } from '../commands/run-command';
import { ApproximaClient } from '../services/client';
import { IUser } from '../models/user';

const botName = 'approxima_bot';

const emptyCommandRegex = new RegExp(`^/?(${commands.join('|')})(?:@${botName})? *$`, 'i');
const commandWithArgRegex = new RegExp(`^/?(${commands.join('|')})(?:@${botName})? +(.*)$`, 'i');
const cleanMessageRegex = new RegExp(`^/?([^@]*@?)(?:@${botName})? *$`, 'i');

export const onText = async (client: ApproximaClient, msg: TelegramBot.Message): Promise<void> => {
  const msgText = msg.text;
  const fromId = msg.from!.id;

  // TODO: logging/report system
  if (msg.reply_to_message) return;
  if (!msgText) {
    console.error('No message text');
    console.log(msg);
    return;
  }
  if (!fromId) {
    console.error('No user id');
    console.log(msg);
    return;
  }

  let user: IUser | undefined;
  try {
    user = await client.db.user.get(client.userId);
  }
  catch {
    console.log(`The following user is not registered: ${client.username}`);
  }

  const cleanMsgText = cleanMessageRegex.exec(msgText)![1];

  const state = client.getCurrentState();

  state.currentUser = user as IUser;

  if (cleanMsgText === 'reset') {
    client.resetCurrentState();
    return;
  }

  if (state.endKeyboardCommandOnText) {

    const {
      deleteKeyboard,
      keyboardId
    } = state.endKeyboardCommandOnText;

    if (deleteKeyboard && keyboardId) {
      client.deleteMessage(state.endKeyboardCommandOnText.keyboardId);
    }

    client.resetCurrentState();
  }

  const emptyCommandExec = emptyCommandRegex.exec(msgText);
  const commandWithArgExec = commandWithArgRegex.exec(msgText);

  if (state.currentCommand !== '' && state.currentState !== 'INITIAL') {
    runCommand(client, state.currentCommand, cleanMsgText);
  }
  else if (emptyCommandExec) {
    const command = emptyCommandExec[1] as Command;
    runCommand(client, command);
  }
  else if (commandWithArgExec) {
    const command = commandWithArgExec[1] as Command;
    const arg = commandWithArgExec[2];
    runCommand(client, command, arg);
  }
  else {
    if (!state.currentUser) {
      client.sendMessage('Você precisa se registrar para continuar!');
      return;
    }
    // Command not found
    client.sendMessage(`Comando \`${cleanMsgText}\` não encontrado`, { parse_mode: 'Markdown' });
  }

};
