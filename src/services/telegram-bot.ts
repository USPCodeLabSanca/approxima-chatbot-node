process.env.NTBA_FIX_319 = 1 as any;

import TelegramBot from 'node-telegram-bot-api';
import { onText } from './on-text';
import { stateMachine } from '../command/command-state-machine';
import { onCallbackQuery } from './on-callback-query';
import { IDb } from '../models/db';
import { UserController } from '../controllers/user';


const isProd = process.env.NODE_ENV === 'production';
const PORT = +process.env.PORT! || 3000;

const botToken = process.env.BOT_TOKEN!;

let telegramBot: TelegramBot;
if (isProd) {
  const herokuUrl = process.env.HEROKU_URL!;
  telegramBot = new TelegramBot(botToken, { webHook: { port: PORT } });
  telegramBot.setWebHook(`${herokuUrl}/bot${botToken}`);
}
else {
  telegramBot = new TelegramBot(botToken, { polling: true });
}

telegramBot.on('text', async (msg) => {

  if (!msg.from) {
    return;
  }

  const bot = new ApproximaBot(msg, msg.message_id);
  await onText(bot, msg);
});

telegramBot.on('callback_query', async (msg) => {

  if (!msg.message) {
    console.error('No message in callback query');
    return;
  }

  const bot = new ApproximaBot(msg, msg.message.message_id);
  await onCallbackQuery(bot, msg);
});

console.log('Approxima bot started running');

export class ApproximaBot {

  private messageId: number | undefined;

  public userId: number;
  public name: string;
  public arroba: string | undefined;
  public db: IDb;

  constructor(
    msg: TelegramBot.Message | TelegramBot.CallbackQuery,
    messageId?: number
  ) {
    this.userId = msg.from!.id;
    this.name = msg.from!.first_name;
    this.arroba = msg.from!.username;
    this.messageId = messageId;
    this.db = {
      user: new UserController()
    };
  }

  sendMessage = async (
    text: string,
    options?: TelegramBot.SendMessageOptions,
    selfDestruct?: number
  ) => {
    options = options ?? { reply_markup: { remove_keyboard: true } };
    const msg = await telegramBot.sendMessage(
      this.userId,
      text,
      { ...{ parse_mode: 'Markdown' }, ...options }
    );
    if (selfDestruct) {
      setTimeout(() => {
        this.deleteMessage(msg.message_id);
      }, selfDestruct);
    }
    return msg;
  }

  editMessage = (text: string, options?: TelegramBot.EditMessageTextOptions) => {
    telegramBot.editMessageText(
      text,
      {
        ...{ chat_id: this.userId, message_id: this.messageId },
        ...options
      }
    );
  }

  deleteMessage = (messageId: string | number) => {
    telegramBot.deleteMessage(this.userId, String(messageId));
  }

  getCurrentState = <T = any>() => {
    return stateMachine.getState<T>(this.userId);
  }

  getCurrentContext = <T = any>() => {
    return stateMachine.getState<T>(this.userId).context;
  }

}
