import { Db } from 'mongodb';
import TelegramBot from 'node-telegram-bot-api';
import { stateMachine } from '../commands/command-state-machine';
import { UserController } from '../database/controller/user';
import { getTelegramBot } from './telegram-bot';

const telegramBot = getTelegramBot();

interface IOtherClientOptions {
  /** The message will self destruct (dissapear) after `selfDestruct milliseconds` */
  selfDestruct?: number;
  /** User this id to send the message to other chat/user */
  chatId?: number
}

interface IDb {
  user: UserController;
}

export class ApproximaClient {

  public userId: number;
  public name: string;
  public username: string | undefined;
  public db: IDb;

  constructor(
    db: Db,
    msg: TelegramBot.Message | TelegramBot.CallbackQuery,
    private messageId?: number
  ) {
    this.userId = msg.from!.id;
    this.name = msg.from!.first_name;
    this.username = msg.from!.username;
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
