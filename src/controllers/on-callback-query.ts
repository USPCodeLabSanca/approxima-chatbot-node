import TelegramBot from 'node-telegram-bot-api';
import { runCommand } from '../commands/run-command';
import { msInAMinute } from '../helpers/date';
import { ApproximaClient } from '../services/client';

export const onCallbackQuery = async (
  client: ApproximaClient,
  msg: TelegramBot.CallbackQuery
): Promise<void> => {
  const callBackData = msg.data;

  const state = client.getCurrentState();

  client.answerCallbackQuery();

  if (state.currentCommand === '') {
    return;
  }

  client.getCurrentState().callbackTimeoutId = setTimeout(() => {
    client.resetCurrentState();
  }, msInAMinute * 1.2) as any;

  runCommand(client, state.currentCommand, callBackData);
};
