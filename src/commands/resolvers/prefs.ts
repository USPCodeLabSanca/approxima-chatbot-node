import TelegramBot from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/commands';
import { removeByValue } from '../../helpers/array';
import { categories } from '../../data/categories';

interface IPrefsContext {
  subMenu: string;
  interests: string[];
  keyboardId: number;
}

const keyboardResponseText = 'Escolha suas categorias de interesse.\n' +
  'Utilizaremos elas para te recomendar pessoas que tenham gostos parecidos com os seus.\n' +
  'O que você marcar aqui NÃO SERÁ VISÍVEL para nenhum outro usuário além de você mesmo!\n';

const buildKeyboard = (context: IPrefsContext) => {
  const keyboard: TelegramBot.InlineKeyboardButton[][] = [];

  const {
    subMenu,
    interests,
  } = context;

  let categoriesToShow: { [category: string]: { id: number } };

  if (!subMenu) {
    categoriesToShow = categories;
  }
  else {
    // Get the object which contains all sub-categories
    categoriesToShow = categories[subMenu].subCategories;
  }

  for (const category of Object.keys(categoriesToShow)) {

    let categoryId = '';
    if (subMenu) {
      categoryId = String(categories[subMenu].id) +
        ',' + String(categoriesToShow[category].id);
    }
    else {
      categoryId = String(categoriesToShow[category].id);
    }

    let categoryText = '';
    let callbackData = '';

    if (
      !subMenu &&
      Object.keys(categories[category].subCategories).length > 0
    ) {
      categoryText = category + ' ⬊';
      callbackData = 'open' + category;
    }
    else if (interests.includes(categoryId)) {
      categoryText = '✅ ' + category;
      callbackData = 'toogle' + categoryId;
    }
    else {
      categoryText = category;
      callbackData = 'toogle' + categoryId;
    }

    keyboard.push([
      { text: categoryText, callback_data: callbackData }
    ]);
  }

  if (subMenu) {
    keyboard.push(
      [{ text: '⬉ VOLTAR', callback_data: 'goback' }]
    );
  }

  keyboard.push(
    [{ text: '❰ ENVIAR ❱', callback_data: 'finish' }]
  );

  keyboard.push(
    [{ text: '❰ CANCELAR ❱', callback_data: 'cancel' }]
  );

  return keyboard;
};

export const prefsCommand: CommandStateResolver<'prefs'> = {
  INITIAL: async (client) => {

    const user = await client.db.user.get(client.userId);
    const context = client.getCurrentContext<IPrefsContext>();
    context.interests = user.interests;

    const keyboard = buildKeyboard(context);
    const message = await client.sendMessage(keyboardResponseText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

    context.keyboardId = message.message_id;

    return 'CHOOSING' as const;
  },
  CHOOSING: async (client, arg, originalArg) => {
    const context = client.getCurrentContext<IPrefsContext>();
    if (arg === 'finish') {
      await client.db.user.edit(client.userId, { interests: context.interests });
      client.deleteMessage(context.keyboardId);
      client.sendMessage('Preferencias salvas!');
      return 'END';
    }
    else if (arg.startsWith('open')) {
      context.subMenu = originalArg.substr(4);
    }
    else if (arg === 'goback') {
      context.subMenu = '';
    }
    else if (arg === 'cancel') {
      client.deleteMessage(context.keyboardId);
      client.sendMessage('Preferências não salvas');
      return 'END';
    }
    else if (arg.startsWith('toogle')) { // Arg is categoryId
      const categoryId = arg.substr(6);
      if (context.interests.includes(categoryId)) {
        removeByValue(context.interests, categoryId);
      }
      else {
        context.interests.push(categoryId);
      }
    }
    else {
      /* eslint-disable max-len */
      const responseText = 'Por favor, clique em ENVIAR para terminar de atualizar as suas preferências.';
      /* eslint-enable max-len */
      client.sendMessage(responseText);
      return 'CHOOSING';
    }

    const keyboard = buildKeyboard(context);
    client.editMessage(keyboardResponseText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
    return 'CHOOSING';
  }
};
