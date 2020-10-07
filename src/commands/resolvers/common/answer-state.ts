import { ApproximaClient } from '../../../services/client';

export const answerState = async (
  client: ApproximaClient, arg: string
): Promise<'END' | 'ANSWER'> => {

  const {
    context,
    currentUser
  } = client.getCurrentState<{ lastShownId?: number, messageId: number }>();
  const targetId = context.lastShownId;

  if (!targetId) {
    throw Error('There should be an targetId here in ANSWER state of show/random command');
  }

  if (arg === 'dismiss') {
    currentUser.rejects.push(targetId);
    // Saves in DB
    client.db.user.edit(client.userId, { 'rejects': currentUser.rejects });
    client.registerAction('answered_suggestion', { answer: arg });

    client.sendMessage('Sugestão rejeitada.');

    return 'END';
  }
  else if (arg !== 'connect') {
    client.sendMessage(
      'Você deve decidir a sua ação acerca do usuário acima antes de prosseguir.',
      undefined,
      {
        selfDestruct: 3000,
      }
    );
    return 'ANSWER';
  }

  currentUser.invited.push(targetId);
  // Update my info on BD
  client.db.user.edit(client.userId, { 'invited': currentUser.invited });
  client.registerAction('answered_suggestion', { answer: arg });

  // Now, let's update info from the target user
  const targetData = await client.db.user.get(targetId);
  targetData.pending.push(client.userId);

  client.db.user.edit(targetId, { 'pending': targetData.pending });

  // Send messages confirming the action
  const targetMsg = 'Você recebeu uma nova solicitação de conexão!\n' +
    'Utilize o comando /pending para vê-la.';

  const targetChat = targetData['chat_id'];

  client.sendMessage(targetMsg, undefined, { chatId: targetChat });
  client.deleteMessage(context.messageId);

  client.sendMessage('Solicitação enviada.');

  return 'END';
};
