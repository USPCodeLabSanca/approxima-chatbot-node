import { ApproximaClient } from '../../../services/client';
import { IUser } from '../../../models/user';

export const answerState = async (
  client: ApproximaClient, arg: string
): Promise<'END' | 'ANSWER'> => {

  const context = client.getCurrentContext<{ lastShownId?: number, user: IUser }>();
  const targetId = context.lastShownId;

  if (!targetId) {
    throw Error('There should be an targetId here in ANSWER state of show command');
  }

  delete context.lastShownId;

  // facilita na hora de referenciar esse usuario
  const userId = client.userId;
  const user = context.user;

  if (arg === 'dismiss') {
    client.registerAction('answered_suggestion', { answer: arg });
    user.rejects.push(targetId);

    // Saves in DB
    client.db.user.edit(userId, { 'rejects': user.rejects });

    client.sendMessage('Sugestão rejeitada.');

    return 'END';
  }
  else if (arg !== 'connect') {
    client.sendMessage(
      'Você deve decidir a sua ação acerca do usuário acima antes de prosseguir.'
    );
    return 'ANSWER';
  }

  client.registerAction('answered_suggestion', { answer: arg });
  user.invited.push(targetId);

  // Update my info on BD
  client.db.user.edit(userId, { 'invited': user.invited });

  // Now, let's update info from the target user
  const targetData = await client.db.user.get(targetId);

  targetData.pending.push(userId);

  client.db.user.edit(targetId, { 'pending': targetData.pending });

  // Send messages confirming the action
  const targetMsg = 'Você recebeu uma nova solicitação de conexão!\n' +
    'Utilize o comando /pending para vê-la.';

  const targetChat = targetData['chat_id'];
  client.sendMessage(targetMsg, undefined, { chatId: targetChat });

  client.sendMessage('Solicitação enviada.');

  return 'END';
};
