import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';

interface INameContext {
  currentName: string;
}

const changeName = (client: ApproximaClient, newName: string, oldName: string) => {
  if (newName == oldName) {
    client.sendMessage('Esse ja é seu nome kk');
    return;
  }
  client.registerAction('edit_name_command', { changed: true, new_name: newName });
  client.db.user.edit(client.userId, { name: newName });
  client.sendMessage('Seu nome foi alterado com sucesso!');
};

export const nameCommand: CommandStateResolver<'name'> = {
  INITIAL: async (client, _arg, originalArg) => {
    const { context, currentUser } = client.getCurrentState<INameContext>();

    context.currentName = currentUser.name;
    if (!originalArg) {
      const response = `Seu nome atual é: ${currentUser.name} \n\n` +
        'Agora, manda pra mim o seu novo nome! Envie um ponto (.) caso tenha desistido de mudá-lo.';
      client.sendMessage(response);

      return 'NEW_NAME';
    }

    changeName(client, originalArg, context.currentName);
    return 'END';

  },
  NEW_NAME: (client, arg, originalArg) => {
    console.log('arg', arg);
    if (arg === '.') {
      client.sendMessage('Ok! Não vou alterar seu nome.');
      return 'END';
    }

    const currentName = client.getCurrentState<INameContext>().context.currentName;
    changeName(client, originalArg, currentName);
    return 'END';
  }
};
