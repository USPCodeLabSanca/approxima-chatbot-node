import TelegramBot from 'node-telegram-bot-api';
import { categories } from '../../../data/categories';
import { ApproximaClient } from '../../../services/client';
import { removeByValue } from '../../../helpers/array';

export interface IPrefsContext {
  subMenu: string;
  interests: string[];
  isRegistering: boolean;
}

export const keyboardResponseText = 'Escolha suas categorias de interesse.\n' +
  'Utilizaremos elas para te recomendar pessoas que tenham gostos parecidos com os seus.\n' +
  'O que você marcar aqui NÃO SERÁ VISÍVEL para nenhum outro usuário além de você mesmo!\n';

export const buildKeyboard = (context: IPrefsContext) => {
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

  if (!context.isRegistering) {
    keyboard.push(
      [{ text: '❰ CANCELAR ❱', callback_data: 'cancel' }]
    );
  }

  return keyboard;
};

export const chooseState = async (
  client: ApproximaClient,
  arg: string,
  originalArg: string,
  currentState: string,
  nextState: string
) => {
  const { context, currentCommand } = client.getCurrentState<IPrefsContext>();
  context.isRegistering = currentCommand === 'start';

  if (arg === 'finish') {
    client.deleteMessage();
    if (!context.isRegistering) {
      client.db.user.edit(client.userId, { interests: context.interests });
      client.registerAction('prefs_command', { changed: true });
      client.sendMessage('Seus interesses foram atualizados!');
    }
    else {
      /* eslint-disable max-len */
      const message = 'Legal! Agora, para finalizar, me conte um pouco mais sobre você e seus gostos... faça uma pequena descrição de si mesmo.\n' +
        'Ela será utilizada para apresentar você para os outros usuários do Approxima (não mostrarei o seu nome).\n\n' +
        'OBS: Você poderá mudar essa descrição depois, mas lembre-se de que somente ela irá aparecer para os outros usuários quando formos te apresentar a eles! Então capricha ;)';
      /* eslint-enable max-len */

      await client.sendMessage('Seus interesses foram registrados!');
      await client.sendMessage(message);
    }
    return nextState;
  }
  else if (arg.startsWith('open')) {
    context.subMenu = originalArg.substr(4);
  }
  else if (arg === 'goback') {
    context.subMenu = '';
  }
  else if (arg === 'cancel') {
    client.deleteMessage();
    client.registerAction('prefs_command', { changed: false });
    client.sendMessage('Ok! Não vou alterar seus interesses.');
    return nextState;
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
    let responseText;
    if (!context.isRegistering) {
      /* eslint-disable max-len */
      responseText = 'Por favor, clique em ENVIAR para terminar de atualizar os seus interesses.';
      /* eslint-enable max-len */
    }
    else {
      responseText = 'Por favor, clique em ENVIAR para terminar de registrar os seus interesses.';
    }
    client.sendMessage(responseText, undefined, { selfDestruct: 4000 });
    return currentState;
  }

  let subMenuText = '';

  if (context.subMenu) {
    subMenuText = `\nMostrando subcategorias de: ${context.subMenu}`;
  }

  const keyboard = buildKeyboard(context);
  client.editMessage(keyboardResponseText + subMenuText, {
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
  return currentState;
};
