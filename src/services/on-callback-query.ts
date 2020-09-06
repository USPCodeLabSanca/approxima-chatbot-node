import TelegramBot from 'node-telegram-bot-api';
import { runCommand } from '../command/run-command';
import { ApproximaClient } from './telegram-bot';

export const onCallbackQuery = async (
  client: ApproximaClient,
  msg: TelegramBot.CallbackQuery
): Promise<void> => {
  const callBackData = msg.data;

  const state = client.getCurrentState();

  if (state.currentCommand === '') {
    return;
  }

  runCommand(client, state.currentCommand, callBackData);

};
