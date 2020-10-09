import { CommandStateResolver } from '../../models/commands';
import { rank } from '../../services/ranker';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { answerState } from './common/answer-state';

interface IShowContext {
  lastShownId: number | undefined;
  messageId: number;
}

export const showCommand: CommandStateResolver<'show'> = {
  INITIAL: async (client, _arg) => {
    /**
    show => Mostra uma pessoa que tem interesses em comum (vai com base no ranking).
    Embaixo, um botão para enviar a solicitação de conexão deve existir,
    bem como um botão de "agora não".
    **/

    client.registerAction('show_person_command');

    const { currentUser, context } = client.getCurrentState<IShowContext>();

    // get all active users (IDs) from the DB
    const allUsers = await client.db.user.getAll();

    // Usuarios que podem aparecer para mim, de acordo com os dados do meu perfil
    const allowedUsers = allUsers.filter(otherUser => {
      return otherUser._id !== currentUser._id &&
        !currentUser.invited.includes(otherUser._id) &&
        !currentUser.rejects.includes(otherUser._id) &&
        !currentUser.pending.includes(otherUser._id) &&
        !currentUser.connections.includes(otherUser._id);
    });

    if (allowedUsers.length === 0) {
      client.sendMessage(
        'Não tenho ninguém novo para te mostrar no momento... que tal tentar amanhã? :)'
      );
      return 'END';
    }

    // Mapeia os usuarios aos seus interesses
    const usersInterests: { [userId: number]: string[] } = {};
    for (const user of allowedUsers) {
      if (!user['rejects'].includes(client.userId)) {
        usersInterests[user._id] = user.interests;
      }
    }
    const target = rank(currentUser.interests, usersInterests);

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

    const message = await client.sendMessage(
      text, { reply_markup: { inline_keyboard: keyboard } }
    );
    context.messageId = message.message_id;

    return 'ANSWER';
  },
  ANSWER: answerState
};
