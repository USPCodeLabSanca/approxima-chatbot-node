import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';

interface IDeleteContext {
  messageId?: number;
}

const deleteConnection = async (client: ApproximaClient, username: string) => {
  const { currentUser } = client.getCurrentState<IDeleteContext>();

  if (currentUser.username === username) {
    const response = 'Você não pode desfazer uma conexão consigo mesmo hahaha\n\n' +
      'Me mande o username (@algoaqui) do usuário com o qual você quer desfazer a conexão.\n' +
      'Caso tenha desistido, me envie um ponto (.)';

    client.sendMessage(response);
    return 'DEL_FRIEND';
  }

  const targetUser = await client.db.user.getByUsername(username);

  if (!targetUser) {
    const response = 'O usuário solicitado não existe :/\n' +
      'Caso queira tentar novamente, utilize o comando /delete de novo.';

    client.sendMessage(response);
    // eslint-disable-next-line
    client.registerAction('delete_command', { type: 'connection', target: username, user_exists: false });
    return 'END';
  }

  // Deleto a conexão entre os dois (e registro)

  const myNewConnections = currentUser.connections.filter(
    userId => userId !== targetUser!._id
  );
  const theirNewConnections = targetUser.connections.filter(
    userId => userId !== currentUser._id
  );

  // Modify my data...
  client.db.user.edit(currentUser._id, {
    connections: myNewConnections,
  });
  // And theirs...
  client.db.user.edit(targetUser._id, {
    connections: theirNewConnections,
  });

  if (currentUser.pokes) {
    if (currentUser.pokes.includes(targetUser._id)) {
      const myNewPokes = currentUser.pokes.filter(userId => userId !== targetUser!._id);
      client.db.user.edit(currentUser._id, {
        pokes: myNewPokes,
      });
    }
  }

  if (targetUser.pokes) {
    if (targetUser.pokes.includes(currentUser._id)) {
      const theirNewPokes = targetUser.pokes.filter(userId => userId !== currentUser._id);
      client.db.user.edit(targetUser._id, {
        pokes: theirNewPokes,
      });
    }
  }

  client.sendMessage('A conexão foi removida com sucesso!');

  client.registerAction('delete_command',
    {
      type: 'connection',
      target: username,
      user_exists: true,
      confirmed: true
    }
  );

  return 'END';
};

const deleteUser = async (client: ApproximaClient) => {
  // Me marco como inativo no banco...
  client.db.user.edit(client.userId, { active: false });
  // ... e me removo de todos os outros documentos que me referenciarem
  client.db.user.removeReferencesOf(client.userId);
  client.db.user.edit(client.userId, {
    rejects: [],
    invited: [],
    connections: [],
    pokes: [],
  });
};

export const deleteCommand: CommandStateResolver<'delete'> = {
  INITIAL: async (client, _arg) => {
    const { context } = client.getCurrentState<IDeleteContext>();

    const keyboard = [
      [{ text: 'DESFAZER CONEXÃO', callback_data: 'connection' }],
      [{ text: 'ME DESCADASTRAR', callback_data: 'myself' }]
    ];

    const response = 'Escolha abaixo a sua ação:';

    const message = await client.sendMessage(
      response, { reply_markup: { inline_keyboard: keyboard } }
    );

    context.messageId = message.message_id;

    return 'SWITCH' as const;
  },
  SWITCH: async (client, arg) => {
    const { context } = client.getCurrentState<IDeleteContext>();
    const lastMessageId = context.messageId;

    if (!lastMessageId) {
      throw Error('There should be an lastMessageId here in SWITCH state of delete command');
    }

    if (arg === 'connection') {
      /* eslint-disable max-len */
      const response = 'Agora, me fale o username (@algoaqui) do usuário para que eu desfaça a conexão!\n' +
        'Envie um ponto (.) caso tenha desistido.';
      client.sendMessage(response);
      /* eslint-enable max-len */
      client.deleteMessage(lastMessageId);
      return 'DEL_FRIEND';
    }
    else if (arg === 'myself') {
      /* eslint-disable max-len */
      const response = 'Aaah, sério?!! :(\n' +
        'Agradeço muuuuito por você ter se disposto a usar o Approxima! 💜🧡\n' +
        'Lembre-se que as portas sempre estarão abertas para você criar uma conta novamente, seja por mim ou no futuro app!\n\n' +
        'Por favor, confirme a sua ação abaixo:';
      /* eslint-enable max-len */

      const keyboard = [
        [{ text: 'SIM, CONTINUAR', callback_data: 'confirm' },
          { text: 'NÃO, CANCELAR', callback_data: 'cancel' }]
      ];

      const message = await client.sendMessage(
        response, { reply_markup: { inline_keyboard: keyboard } }
      );

      client.deleteMessage(lastMessageId);

      context.messageId = message.message_id;

      return 'DEL_MYSELF';
    }

    // Else: usuario mandou lixo
    const response = 'Você deve decidir a sua ação antes de prosseguir.\n\n' +
      'Não se preocupe! Você não será obrigade a continuar ao escolher uma ação :)';

    client.sendMessage(
      response,
      undefined,
      {
        selfDestruct: 10000,
      }
    );
    return 'SWITCH';
  },
  DEL_FRIEND: (client, arg, originalArg) => {
    if (arg === '.') {
      client.sendMessage('Ok! Não vou remover nenhuma conexão sua.');
      client.registerAction('delete_command', { type: 'connection', confirmed: false });
      return 'END';
    }
    // Else: behave normally
    return deleteConnection(client, originalArg);
  },
  DEL_MYSELF: (client, arg) => {
    const { context } = client.getCurrentState<IDeleteContext>();
    const lastMessageId = context.messageId;

    if (arg === 'confirm') {
      client.deleteMessage(lastMessageId);

      const reply = 'Você foi descadastrado com sucesso! (Triste...)\n' +
        'Caso queira retomar a sua conta à qualquer momento, simplesmente dê um /start.\n\n' +
        'Até mais 💜🧡';
      client.sendMessage(reply);

      deleteUser(client);

      client.registerAction('delete_command', { type: 'myself', confirmed: true });

      return 'END';
    }

    else if (arg === 'cancel') {
      /* eslint-disable max-len */
      const response = 'Que bom que você resolveu me dar uma segunda chance!!! 💜🧡\n' +
        'Que tal me dar uns comandos? :)';
      /* eslint-enable max-len */
      client.deleteMessage(lastMessageId);
      client.sendMessage(response);
      client.registerAction('delete_command', { type: 'myself', confirmed: false });
      return 'END';
    }

    // Else: usuario mandou lixo
    const response = 'Você deve decidir a sua ação antes de prosseguir.';

    client.sendMessage(
      response,
      undefined,
      {
        selfDestruct: 10000,
      }
    );
    return 'DEL_MYSELF';
  }
};
