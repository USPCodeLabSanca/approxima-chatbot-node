import { CommandStateResolver } from '../../models/commands';

export const clearCommand: CommandStateResolver<'clear'> = async (client, _arg) => {
  /**
  Deleta o array de pessoas que o usuario já rejeitou,
  permitindo que elas apareçam novamente nas buscas
  **/

  const { currentUser } = client.getCurrentState();

  client.registerAction('clear_rejects_command');

  if (currentUser.rejects.length == 0) {
    client.sendMessage(
      'Você não "rejeitou" ninguém por enquanto.');
    return 'END';
  }
  currentUser.rejects = [];
  client.db.user.edit(currentUser._id, { rejects: [] });

  client.sendMessage(
    'Tudo certo! Sua lista de "rejeitados" foi limpa!'
  );

  return 'END' as const;
};
