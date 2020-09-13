process.env.NTBA_FIX_319 = 1 as any;

import TelegramBot from 'node-telegram-bot-api';
import { isProd } from '../helpers';

const PORT = Number(process.env.PORT!) || 3000;

const botToken = process.env.BOT_TOKEN!;

// Start Telegram bot with webHook if it is prod or pooling if it is local
let telegramBot: TelegramBot;
if (isProd) {
  const herokuUrl = process.env.HEROKU_URL!;
  telegramBot = new TelegramBot(botToken, { webHook: { port: PORT } });
  telegramBot.setWebHook(`${herokuUrl}/bot${botToken}`);
}
else {
  telegramBot = new TelegramBot(botToken, { polling: true });
}

export const getTelegramBot = () => {
  return telegramBot;
};
