import { randomInt } from '../../helpers';
import { CommandStateResolver } from '../../models/commands';
import { answerState } from './common/answer-state';
import { IUser } from '../../models/user';

interface IRandomContext {
  user: IUser;
  lastShownId?: number;
  messageId: number;
}

export const randomCommand: CommandStateResolver<'random'> = {
  INITIAL: async (client, _arg) => {
    /**
    random => Mostra uma pessoa: any aleatória. Embaixo, um botão para enviar a solicitação
    de conexão deve existir, bem como um botão de "agora não".
    **/

    client.registerAction('random_person_command');
    const state = client.getCurrentState<IRandomContext>();
    const currentUser = state.currentUser!;
    const context = state.context;

    const allUsers = await client.db.user.getAll();

    const myAllowedUsers = allUsers.filter(otherUser => {
      return otherUser._id !== client.userId &&
        !currentUser.invited.includes(otherUser._id) &&
        !currentUser.rejects.includes(otherUser._id) &&
        !currentUser.pending.includes(otherUser._id) &&
        !currentUser.connections.includes(otherUser._id);
    });

    // Preciso, ainda, tirar aqueles que me tem em sua lista de rejects
    const finalAllowedUsers = [];
    for (const user of myAllowedUsers) {
      if (!user.rejects.includes(user._id)) {
        finalAllowedUsers.push(user);
      }
    }

    if (finalAllowedUsers.length === 0) {
      client.sendMessage(
        'Não tenho ninguém novo para te mostrar no momento... que tal tentar amanhã? :)'
      );
      return 'END';
    }

    const target = finalAllowedUsers[randomInt(0, finalAllowedUsers.length)];
    const targetBio = (await client.db.user.get(target._id)).bio;

    // Avisa no contexto que essa pessoa foi a ultima a ser exibida para o usuario (ajuda nas callback queries)
    context.lastShownId = target._id;

    // MENSAGEM DO BOT

    const keyboard = [[
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
