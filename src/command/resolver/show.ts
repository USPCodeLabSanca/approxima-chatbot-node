import { CommandStateResolver } from '../../models/command';
import { rank } from '../../services/ranker';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { includeElement } from '../../helpers/array';

interface IShowContext {
  lastShownId: number | undefined;
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

    const myData = await client.db.user.get(userId);

    // get all users (IDs) from the DB
    const allUsers = await client.db.user.getAll();

    // Usuarios que podem aparecer para mim, de acordo com os dados do meu perfil
    const allowedUsers = allUsers.filter(user => {
      const otherUserId = user._id;
      return otherUserId !== userId &&
        !includeElement(myData.pending, otherUserId) &&
        !includeElement(myData.invited, otherUserId) &&
        !includeElement(myData.connections, otherUserId) &&
        !includeElement(myData.rejects, otherUserId);
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
    const target = rank(myData.interests, usersInterests);

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
  ANSWER: async (client, arg) => {
    const context = client.getCurrentContext<IShowContext>();
    const targetId = context.lastShownId;

    if (!targetId) {
      throw Error('There should be an targetId here in ANSWER state of show command');
    }

    delete context.lastShownId;

    // facilita na hora de referenciar esse usuario
    const userId = client.userId;
    const user = await client.db.user.get(userId);

    if (arg === 'dismiss') {

      user.rejects.push(targetId);

      // Saves in DB
      client.db.user.edit(userId, { 'rejects': user.rejects });

      client.sendMessage('Sugestão rejeitada.');

      return 'END';
    }
    else if (arg !== 'connect') {
      client.sendMessage(
        'Você deve decidir a sua ação acerca do usuário acima antes de prosseguir.'
      );
      return 'ANSWER';
    }

    user.invited.push(targetId);

    // Update my info on BD
    client.db.user.edit(userId, { 'invited': user.invited });

    // Now, let's update info from the target user
    const targetData = await client.db.user.get(targetId);

    targetData.pending.push(userId);

    client.db.user.edit(targetId, { 'pending': targetData.pending });

    // Send messages confirming the action
    const targetMsg = 'Você recebeu uma nova solicitação de conexão!\n' +
      'Utilize o comando /pending para vê-la.';

    const targetChat = targetData['chat_id'];
    client.sendMessage(targetMsg, undefined, { chatId: targetChat });

    client.sendMessage('Solicitação enviada.');

    return 'END';
  }
};
