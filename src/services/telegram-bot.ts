process.env.NTBA_FIX_319 = 1 as any;

import TelegramBot from 'node-telegram-bot-api';
import { onText } from './on-text';
import { stateMachine } from '../command/command-state-machine';
import { onCallbackQuery } from './on-callback-query';
import { IDb } from '../models/db';
import { UserController } from '../controllers/user';
import { Db } from 'mongodb';
import { getDb } from './db';


const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT!) || 3000;

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

(async () => {

  const db = await getDb();

  telegramBot.on('text', async (msg) => {
    if (!msg.from) {
      return;
    }

    const client = new ApproximaClient(db, msg, msg.message_id);
    await onText(client, msg);
  });

  telegramBot.on('callback_query', async (msg) => {

    if (!msg.message) {
      console.error('No message in callback query');
      return;
    }

    const client = new ApproximaClient(db, msg, msg.message.message_id);
    await onCallbackQuery(client, msg);
  });

  console.log('Approxima bot started running');
})();

interface IOtherClientOptions {
  /** The message will self destruct (dissapear) after `selfDestruct milliseconds` */
  selfDestruct?: number;
  /** User this id to send the message to other chat/user */
  chatId?: number
}

export class ApproximaClient {

  private messageId: number | undefined;

  public userId: number;
  public name: string;
  public username: string | undefined;
  public db: IDb;

  constructor(
    db: Db,
    msg: TelegramBot.Message | TelegramBot.CallbackQuery,
    messageId?: number
  ) {
    this.userId = msg.from!.id;
    this.name = msg.from!.first_name;
    this.username = msg.from!.username;
    this.messageId = messageId;
    this.db = {
      user: new UserController(db)
    };
  }

  sendMessage = async (
    text: string,
    telegrmsOptions?: TelegramBot.SendMessageOptions,
    otherOptions?: IOtherClientOptions
  ) => {
    telegrmsOptions = telegrmsOptions ?? { reply_markup: { remove_keyboard: true } };
    const msg = await telegramBot.sendMessage(
      otherOptions?.chatId || this.userId,
      text,
      telegrmsOptions
    );
    if (otherOptions?.selfDestruct) {
      setTimeout(() => {
        this.deleteMessage(msg.message_id);
      }, otherOptions.selfDestruct);
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
