import { Db } from 'mongodb';
import TelegramBot from 'node-telegram-bot-api';
import { stateMachine } from '../commands/command-state-machine';
import { StatsController } from '../database/controllers/stats';
import { UserController } from '../database/controllers/user';
import { StatsActions } from '../models/stats';
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
  stats: StatsController;
}

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

interface IBotMessage {
  message?: TelegramBot.Message;
  callbackMessage?: TelegramBot.CallbackQuery;
}

export class ApproximaClient {

  public userId: number;
  public name: string;
  public username: string | undefined;

  protected message?: TelegramBot.Message;
  protected callbackMessage?: TelegramBot.CallbackQuery;

  public db: IDb;

  constructor(
    db: Db,
    { message, callbackMessage }: RequireAtLeastOne<IBotMessage>
  ) {
    this.message = message;
    this.callbackMessage = callbackMessage;

    const msg = (message || callbackMessage)!;
    this.userId = msg.from!.id;
    this.name = msg.from!.first_name;
    if (msg.from!.username) {
      this.username = '@' + msg.from!.username;
    }
    this.db = {
      user: new UserController(db),
      stats: new StatsController(db)
    };
  }

  private getMessageId = () => {
    if (this.message) {
      return this.message.message_id;
    }
    else {
      return this.callbackMessage!.message!.message_id;
    }
  }

  sendMessage = async (
    text: string,
    telegramOptions?: TelegramBot.SendMessageOptions,
    otherOptions?: IOtherClientOptions
  ) => {
    telegramOptions = telegramOptions ?? { reply_markup: { remove_keyboard: true } };
    const msg = await telegramBot.sendMessage(
      otherOptions?.chatId || this.userId,
      text,
      telegramOptions
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
        ...{ chat_id: this.userId, message_id: this.getMessageId() },
        ...options
      }
    );
  }

  /** Delete a message, if the argument is present, that message will be deleted
   *
   * If it is not present, the last message will be deleted */
  deleteMessage = (messageId?: string | number) => {
    messageId = messageId ? String(messageId) : String(this.getMessageId());
    return telegramBot.deleteMessage(this.userId, messageId);
  }

  answerCallbackQuery = () => {
    if (!this.callbackMessage) return;
    telegramBot.answerCallbackQuery(this.callbackMessage.id);
  }

  registerAction = (actionName: StatsActions, data?: any) => {
    this.db.stats.registerAction(actionName, this.userId, data);
  }

  resetCurrentState = () => {
    stateMachine.resetState(this.userId);
  }

  getCurrentState = <T = any>() => {
    return stateMachine.getState<T>(this.userId);
  }
}
