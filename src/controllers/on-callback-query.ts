import TelegramBot from 'node-telegram-bot-api';
import { runCommand } from '../commands/run-command';
import { ApproximaClient } from '../services/client';

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
