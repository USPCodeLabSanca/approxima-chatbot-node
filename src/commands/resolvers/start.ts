import { commands, CommandStateResolver } from '../../models/commands';
import { buildKeyboard, keyboardResponseText, chooseState } from './common/prefs';

interface IStartContext {
  name?: string;
  desc?: string;
  interests: string[];
  subMenu: string;
  isRegistering: true;
}

export const startCommand: CommandStateResolver<'start'> = {
  INITIAL: async (client) => {
    const { currentUser: user } = client.getCurrentState();
    let newUser = false;

    if (user) {
      if (user.active) {
        client.registerAction('start_command', { new_user: newUser, user_without_username: false });

        const message = 'É muito bom ter você de volta! Bora começar a usar o Approxima :)\n' +
          'Me diz: o que você quer fazer agora?\n\n' +
          'Use /help para uma lista dos comandos disponíveis.\n';

        client.sendMessage(message);
        return 'END';
      }
      else {
        client.registerAction('start_command', { new_user: newUser, signin_after_signout: true });

        // Register in database that I'm back
        // The 3rd argument if to allow me to edit an inactive user
        client.db.user.edit(client.userId, { active: true }, true);

        const message = 'Eu estou muito feliz de ver que você está de volta ao Approxima!!!\n' +
          'Seja muuuuito bem-vinde novamente 💜🧡\n\n' +
          'Para uma lista dos comandos disponíveis, use o /help!\n';
        client.sendMessage(message);

        return 'END';
      }
    }

    newUser = true;

    if (!client.username) {

      client.registerAction('start_command', { new_user: newUser, user_without_username: true });

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

    client.registerAction('start_command', { new_user: newUser, user_without_username: false });

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
    context.interests = [];
    context.isRegistering = true;

    const keyboard = buildKeyboard(context);
    client.sendMessage(keyboardResponseText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

    return 'CHOOSE_PREFS';
  },
  CHOOSE_PREFS: (client, arg, originalArg) =>
    chooseState(client, arg, originalArg, 'CHOOSE_PREFS', 'DESC') as any,
  DESC: async (client, arg) => {
    const { context } = client.getCurrentState<IStartContext>();
    context.desc = arg;

    await client.db.user.create({
      _id: client.userId,
      chat_id: client.userId,
      username: client.username!,
      name: context.name!,
      bio: context.desc,
      interests: context.interests,
      active: true,
      invited: [],
      rejects: [],
      pending: [],
      connections: [],
    });

    console.log(`New user ${client.username} registered successfully!`);

    /* eslint-disable max-len */
    const response = 'Bem-vinde ao Approxima!!! 🥳\n\n' +
      'Caso se sinta perdide em algum momento, lembre-se que existe o comando /help para te ajudar ;)';
    /* eslint-enable max-len */
    client.sendMessage(response);
    return 'END' as const;
  }
};
