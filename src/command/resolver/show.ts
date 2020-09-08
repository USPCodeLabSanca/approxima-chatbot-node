import { CommandStateResolver } from '../../models/command';
import { rank } from '../../services/ranker';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { includeElement } from '../../helpers/array';
import { answerState } from './answer-state';
import { IUser } from '../../models/user';

interface IShowContext {
  lastShownId: number | undefined;
  user: IUser;
}

export const showCommand: CommandStateResolver<'show'> = {
  INITIAL: async (client, _arg) => {
    /**
    show => Mostra uma pessoa que tem interesses em comum (vai com base no ranking).
    Embaixo, um botão para enviar a solicitação de conexão deve existir,
    bem como um botão de "agora não".
    **/

    const context = client.getCurrentContext<IShowContext>();

    // facilita na hora de referenciar esse usuario
    const userId = client.userId;

    context.user = await client.db.user.get(userId);

    // get all users (IDs) from the DB
    const allUsers = await client.db.user.getAll();

    // Usuarios que podem aparecer para mim, de acordo com os dados do meu perfil
    const allowedUsers = allUsers.filter(user => {
      const otherUserId = user._id;
      return otherUserId !== userId &&
        !includeElement(context.user.pending, otherUserId) &&
        !includeElement(context.user.invited, otherUserId) &&
        !includeElement(context.user.connections, otherUserId) &&
        !includeElement(context.user.rejects, otherUserId);
    });

    if (allowedUsers.length === 0) {
      client.sendMessage(
        'Não tenho ninguém novo para te mostrar no momento... que tal tentar amanhã? :)'
      );
      return 'END';
    }

    // Mapeia os usuarios aos seus interesses
    const usersInterests: {[userId: number]: string[]} = {};
    for (const user of allowedUsers) {
      const userData = await client.db.user.get(user._id);
      if (!includeElement(userData['rejects'], userId)) {
        usersInterests[user._id] = userData.interests;
      }

    }
    const target = rank(context.user.interests, usersInterests);

    if (!target) {
      // Nao ha ninguem com as preferencias do usuario ainda
      /* eslint-disable max-len */
      let response = 'Parece que não há ninguém com os mesmos gostos que você no sistema ainda...\n\n';
      response += 'Você pode tentar:\n';
      response += '- Marcar mais categorias de interesse\n';
      response += '- O comando /random (pessoa aleatória)';
      /* eslint-enable max-len */

      client.sendMessage(response);

      return 'END';
    }

    // Daqui para frente, sabemos que uma pessoa similar existe
    const targetBio = (await client.db.user.get(target)).bio;

    // Avisa no contexto que essa pessoa foi a ultima a ser exibida para o usuario (ajuda nas callback queries)
    context.lastShownId = target;

    // MENSAGEM DO BOT

    const keyboard: InlineKeyboardButton[][] = [[
      { text: 'Conectar', callback_data: 'connect' },
      { text: 'Agora não', callback_data: 'dismiss' }
    ]];

    const text = `"${targetBio}"`;

    client.sendMessage(
      text, { reply_markup: { inline_keyboard: keyboard } }
    );

    return 'ANSWER';
  },
  ANSWER: answerState
};
