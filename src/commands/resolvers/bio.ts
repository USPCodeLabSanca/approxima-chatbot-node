import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';

interface IBioContext {
  currentBio: string;
}

const changeBio = (client: ApproximaClient, newBio: string, oldBio: string) => {
  if (newBio === oldBio) {
    client.sendMessage('Esse ja é sua descriçãos kk');
    return;
  }
  client.registerAction('edit_desc_command', { changed: true, new_desc: newBio });
  client.db.user.edit(client.userId, { bio: newBio });
  client.sendMessage('Sua descrição foi alterado com sucesso!');
};

export const bioCommand: CommandStateResolver<'bio'> = {
  INITIAL: async (client, _arg, originalArg) => {
    const context = client.getCurrentContext<IBioContext>();
    const user = await client.db.user.get(client.userId);
    context.currentBio = user.bio;
    if (!originalArg) {
      const response = `Sua descrição atual é: ${user.bio} \n\n` +
        'Agora, manda pra mim a sua nova descrição! ' +
        'Envie um ponto (.) caso tenha desistido de mudá-la.';
      client.sendMessage(response);

      return 'NEW_BIO';
    }

    changeBio(client, originalArg, context.currentBio);
    return 'END';

  },
  NEW_BIO: (client, arg, originalArg) => {
    if (arg === '.') {
      client.sendMessage('Ok! Não vou alterar seu descrição.');
      return 'END';
    }

    const currentBio = client.getCurrentContext<IBioContext>().currentBio;
    changeBio(client, originalArg, currentBio);
    return 'END';
  }
};
