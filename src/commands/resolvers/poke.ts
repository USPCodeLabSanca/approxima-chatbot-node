import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/commands';
import { IUser } from '../../models/user';
import { ApproximaClient } from '../../services/client';

interface IPokeContext {
  pokedUser: IUser;
}

const sendChooseModeMessage = (client: ApproximaClient) => {

  // TODO: fix this
  /* eslint-disable max-len */
  const response = 'Você tem duas opções:\n' +
    '- Esperar que essa pessoa também dê o comando /poke e direcione-o a você (ela não saberá que você deu o comando), o que pode não acontecer\n' +
    '- Notificar a pessoa que você deu o comando / poke e direcionou para ela(ou seja, avisando que você quer conversar), o que aumenta a chance de vocês conversarem\n\n' +
    'Qual você quer usar?';
  /* eslint-enable max-len */

  const keyboard: InlineKeyboardButton[][] = [
    [
      {
        text: 'Notificar',
        callback_data: 'ON_THE_FACE'
      },
      {
        text: 'Esperar',
        callback_data: 'ANONYMOUS'
      }
    ]
  ];

  client.sendMessage(response, {
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
};

export const pokeCommand: CommandStateResolver<'poke'> = {
  INITIAL: async (client, arg) => {
    const { context } = client.getCurrentState<IPokeContext>();

    // Se tiver um argumento o usuario ja escolheu alguem para dar poke
    if (arg) {
      const user = await client.db.user.getByUsername(arg);
      if (!user) {
        client.sendMessage('Esse usuario não existe mano, se liga'); // TODO: fix this
        return 'CHOOSE_USER';
      }
      context.pokedUser = user;
      sendChooseModeMessage(client);
      return 'CHOOSE_MODE';
    }

    return 'CHOOSE_USER';
  },
  CHOOSE_USER: async (client, arg) => {
    // TODO: register action
    const { context } = client.getCurrentState<IPokeContext>();
    const user = await client.db.user.getByUsername(arg);
    if (!user) {
      client.sendMessage('Esse usuario não existe mano, se liga'); // TODO: fix this
      return 'CHOOSE_USER';
    }
    context.pokedUser = user;
    sendChooseModeMessage(client);
    return 'CHOOSE_MODE';
  },
  CHOOSE_MODE: (client, arg) => {
    const { currentUser, context: { pokedUser } } = client.getCurrentState<IPokeContext>();
    // Escolher poke publico ou anonimo

    if (arg !== 'ANONYMOUS' && arg !== 'ON_THE_FACE') {
      client.sendMessage(
        'Você deve decidir a sua ação acima antes de prosseguir.',
        undefined,
        { selfDestruct: 3000 }
      );
      return 'CHOOSE_MODE';
    }

    if (arg === 'ANONYMOUS') {
      currentUser.pokes ||= [];
      if (currentUser.pokes.includes(pokedUser._id)) {
        client.sendMessage('Voce ja deu poke nelu mano'); // TODO: fix this
        return 'END';
      }

      // Register poke in DB
      currentUser.pokes.push(pokedUser._id);
      client.db.user.edit(currentUser._id, {
        pokes: currentUser.pokes
      });

      // Checar se aquele usuario ja deu poke em mim, se tiver dado avisar nois dois
      if (pokedUser.pokes?.includes(currentUser._id)) {
        // TODO: fix these 2 replies
        const replyToPoker = 'Opa, a pessoa ja tinha te pokeado, vai la falar com elu';
        client.sendMessage(replyToPoker);

        const replyToPoked = 'Opa, a pessoa te pokeou de volta! Bora papear';
        client.sendMessage(replyToPoked, undefined, { chatId: pokedUser._id });
      }
      else {
        // TODO: fix this
        const reply = 'O @ foi pokeado, se ele te pokear de volta eu venho correndo te avisar :P';
        client.sendMessage(reply);
      }
    }
    else {
      // send message to user
      client.sendMessage(
        // TODO: fix this, sugestao: 'chame o @ no pv, ou responde com um poke tbm!'
        `Voce recebeu um poke na sua cara do ${currentUser.username}`,
        undefined,
        { chatId: pokedUser._id }
      );
    }
    return 'END';
  }
};
