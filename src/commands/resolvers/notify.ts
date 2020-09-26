import { CommandStateResolver } from '../../models/commands';

export const notifyCommand: CommandStateResolver<'notify'> = {
  INITIAL: (client) => {
    // facilita na hora de referenciar esse usuario

    let isAdmin = false;
    let adminName = '';

    for (const admin of JSON.parse(process.env.ADMINS!)) {
      if (client.userId == admin.telegramId) {
        isAdmin = true;
        adminName = admin.name;
        break;
      }
    }
    if (!isAdmin) {
      const response = 'O que você está tentando fazer? Esse comando é só para admins.';
      client.sendMessage(response);

      return 'END';
    }
    const response = `Olá ${adminName}!\n` +
      'Me informe a mensagem que deseja mandar para TODOS os usuários do Approxima.\n' +
      'PS: Lembre-se de usar esse recurso com responsabilidade :)';

    client.registerAction('notify_command');

    client.sendMessage(response);

    return 'SEND';
  },
  SEND: async (client, _arg, originalArg) => {
    const allUSers = await client.db.user.getAllIds();

    for (const user of allUSers) {
      try {
        client.sendMessage(originalArg, undefined, { chatId: user });
      }
      catch (error) {
        console.error(`Erro ao interagir com o chat ${user}: ${error}`);
      }
    }
    // Avisa que esse admin mandou o broadcast
    console.log(
      // eslint-disable-next-line
      `${client.getCurrentState().currentUser.name} mandou uma notificação para todos os usuários: ${originalArg}`
    );

    client.registerAction('admin_notified', { 'message': originalArg });

    return 'END' as const;
  }
};
