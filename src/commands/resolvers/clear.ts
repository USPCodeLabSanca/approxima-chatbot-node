import { CommandStateResolver } from '../../models/commands';

export const clearCommand: CommandStateResolver<'clear'> = async (client, _arg) => {
  /**
  Deleta o array de pessoas que o usuario já rejeitou,
  permitindo que elas apareçam novamente nas buscas
  **/

  // facilita na hora de referenciar esse usuario
  const userId = client.userId;
  const user = await client.db.user.get(userId);
  client.registerAction('clear_rejects_command');

  if (user.rejects.length == 0) {
    client.sendMessage(
      'Você não "rejeitou" ninguém por enquanto.');
    return 'END';
  }
  user.rejects = [];
  client.db.user.edit(userId, { rejects: [] });

  client.sendMessage(
    'Tudo certo! Sua lista de "rejeitados" foi limpa!'
  );

  return 'END' as const;
};
