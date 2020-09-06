import TelegramBot from 'node-telegram-bot-api';
import {
  commands,
  Command,
} from '../models/command';
import { runCommand } from '../command/run-command';
import { ApproximaClient } from './telegram-bot';

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

  const cleanMsgText = cleanMessageRegex.exec(msgText)![1];

  const state = client.getCurrentState();

  if (cleanMsgText === '.') {
    state.context = {};
    state.currentCommand = '';
    state.currentState = 'INITIAL';
    return;
  }

  const emptyCommandExec = emptyCommandRegex.exec(msgText);
  const commandWithArgExec = commandWithArgRegex.exec(msgText);

  if (state.currentCommand !== '' && state.currentState !== '') {
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
    // Command not found
    client.sendMessage(`Comando \`${cleanMsgText}\` não encontrado`);
  }

};
