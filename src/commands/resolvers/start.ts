import { commands, CommandStateResolver } from '../../models/commands';

interface IStartContext {
  name?: string,
  bio?: string,
}

export const startCommand: CommandStateResolver<'start'> = {
  INITIAL: async (client) => {
    const state = client.getCurrentState();
    const user = state.currentUser;

    if (user) {
      const message = 'É muito bom ter você de volta! Bora começar a usar o Approxima :)\n' +
        'Me diz: o que você quer fazer agora?\n\n' +
        'Use /help para uma lista dos comandos disponíveis.\n';
      client.sendMessage(message);
      return 'END';
    }

    if (!client.username) {
      const message = 'Parece que você não possui um Nome de Usuário do Telegram ainda :(\n' +
        'Infelizmente, eu não posso completar o seu registro se você não tiver um, ' +
        'pois será a única forma dos outros usuários entrarem em contato com você.\n\n' +
        'Caso queira criar um, basta seguir esses passos (é super simples):\n' +
        '\t1: Vá na parte de Configurações (Settings) do Telegram;\n' +
        '\t2: É só preencher o campo Nome de Usuário (Username);\n' +
        '\t3: Assim que tiver com tudo certinho, me dê o comando /start.\n';

      client.sendMessage(message);
      return 'END';
    }

    client.registerAction('start_command');

    let message = 'Muito prazer! Vamos começar o seu registro no Approxima!';
    client.sendMessage(message);

    message = 'Primeiro, me forneça o seu nome.\n';
    message += 'Ex: João Vitor dos Santos';
    client.sendMessage(message);

    return 'NAME';
  },
  NAME: (client, arg) => {
    if (commands.includes(arg)) {
      const message = 'Seu nome não pode ser um comando! (Tá tentando me hackear? 🤔)\n\n' +
        'Por favor, forneça um nome válido.';

      client.sendMessage(message);
      return 'NAME';
    }

    const { context } = client.getCurrentState<IStartContext>();
    context.name = arg;

    /* eslint-disable max-len */
    const message = 'Legal! Agora, me conte um pouco mais sobre seus gostos... faça uma pequena descrição de si mesmo.\n' +
      'Ela será utilizada para apresentar você para os outros usuários do Approxima (não mostrarei o seu nome).\n\n' +
      'OBS: Você poderá mudar essa descrição depois, mas lembre-se de que somente ela irá aparecer para os outros usuários quando formos te apresentar a eles!';
    /* eslint-enable max-len */
    client.sendMessage(message);
    return 'BIO';
  },
  BIO: async (client, arg) => {
    const { context } = client.getCurrentState<IStartContext>();
    context.bio = arg;

    await client.db.user.create({
      _id: client.userId,
      chat_id: client.userId,
      username: client.username!,
      name: context.name!,
      bio: context.bio,
      interests: [],
      invited: [],
      rejects: [],
      pending: [],
      connections: [],
    });

    console.log(`New user ${client.username} registered successfully!`);

    /* eslint-disable max-len */
    const response = 'Boa! Agora só falta você adicionar alguns interesses para começar a usar o Approxima!\n' +
      'Clique (ou toque) aqui --> /prefs\n\n' +
      'Após finalizada a etapa acima você já poderá começar a usar os meus comandos!\n' +
      'Caso se sinta perdido em algum momento, lembre-se que existe o comando /help para te ajudar ;)';
    /* eslint-enable max-len */
    client.sendMessage(response);
    return 'END' as const;
  }
};
