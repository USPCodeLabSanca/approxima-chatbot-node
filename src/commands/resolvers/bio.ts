import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';

interface IBioContext {
  currentBio: string;
}

const changeBio = (client: ApproximaClient, newBio: string, oldBio: string) => {
  if (newBio === oldBio) {
    client.sendMessage('Essa já é sua descrição kk');
    return;
  }
  client.registerAction('edit_desc_command', { changed: true, new_desc: newBio });
  client.db.user.edit(client.userId, { bio: newBio });
  client.sendMessage('Sua descrição foi alterado com sucesso!');
};

export const bioCommand: CommandStateResolver<'desc'> = {
  INITIAL: async (client, _arg, originalArg) => {
    const { currentUser } = client.getCurrentState<IBioContext>();

    if (!originalArg) {
      const response = `Sua descrição atual é: \n\n${currentUser.bio}\n\n` +
        'Agora, manda pra mim a sua nova descrição!\n' +
        'Envie um ponto (.) caso tenha desistido de mudá-la.';
      client.sendMessage(response);

      return 'NEW_BIO';
    }

    changeBio(client, originalArg, currentUser.bio);
    return 'END';

  },
  NEW_BIO: (client, arg, originalArg) => {
    if (arg === '.') {
      client.sendMessage('Ok! Não vou alterar seu descrição.');
      return 'END';
    }

    const { currentUser } = client.getCurrentState<IBioContext>();
    changeBio(client, originalArg, currentUser.bio);
    return 'END';
  }
};
