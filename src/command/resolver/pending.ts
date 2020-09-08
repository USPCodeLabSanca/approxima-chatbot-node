import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { removeByValue } from '../../helpers/array';
import { CommandStateResolver } from '../../models/command';

interface IPendingContext {
  lastShownId?: number;
}

export const pendingCommand: CommandStateResolver<'pending'> = {
  INITIAL: async (client, _arg) => {
    /**
    pending => Mostra todas as solicitações de conexão que aquela pessoa possui e
    para as quais ela ainda não deu uma resposta. Mostra, para cada solicitação,
    a descrição da pessoa e dois botões: conectar ou descartar).
    **/

    const context = client.getCurrentContext<IPendingContext>();

    // facilita na hora de referenciar esse usuario
    const userId = client.userId;

    const myData = await client.db.user.get(userId);

    if (myData.pending.length === 0) {
      client.sendMessage('Você não possui novas solicitações de conexão.');
      return 'END';
    }

    // Pego o primeiro elemento na "fila"
    const target = myData.pending.pop()!;

    const targetData = await client.db.user.get(target);
    const targetBio = targetData.bio;

    // Avisa no contexto que essa pessoa foi a ultima a ser exibida para o usuario (ajuda nas callback queries)
    context.lastShownId = target;

    // Salvo no BD o novo array de 'pending'
    client.db.user.edit(userId, { 'pending': myData.pending });

    // Me retiro da lista de "invited" do outro usuario
    const targetInvited = targetData.invited;
    removeByValue(targetInvited, userId);

    client.db.user.edit(target, { 'invited': targetInvited });

    // MENSAGEM DO BOT

    const keyboard: InlineKeyboardButton[][] = [[
      { text: 'Aceitar', callback_data: 'accept' },
      { text: 'Rejeitar', callback_data: 'reject' }
    ]];

    const text = 'A seguinte pessoa quer se conectar a você:\n\n' +
      `"${targetBio}"`;

    client.sendMessage(text, { reply_markup: { inline_keyboard: keyboard } } );

    return 'ANSWER';
  },
  ANSWER: async (client, arg) => {
    const context = client.getCurrentContext<IPendingContext>();
    const targetId = context.lastShownId;

    if (!targetId) {
      throw Error('There should be a lastShownId in ANSWER state in pending command');
    }

    delete context.lastShownId;

    // facilita na hora de referenciar esse usuario
    const userId = client.userId;
    const myData = await client.db.user.get(userId);

    if (arg === 'reject') {
      myData.rejects.push(targetId);

      // Saves in DB
      client.db.user.edit(userId, { 'rejects': myData.rejects });

      client.sendMessage('Pedido de conexão rejeitado.');

      return 'END';
    }
    else if (arg !== 'accept') {
      client.sendMessage(
        'Você deve decidir a sua ação acerca do usuário acima antes de prosseguir.'
      );
      return 'ANSWER';
    }

    // For now on, we know that the answer is "accept"!

    // Register the new connection
    myData.connections.push(targetId);

    // Update my info on BD
    client.db.user.edit(userId, { 'connections': myData.connections });

    // Update their info on BD

    const targetData = await client.db.user.get(targetId);

    targetData.connections.push(userId);

    client.db.user.edit(targetId, { 'connections': targetData.connections });

    // Send messages confirming the action

    const targetChat = targetData._id;

    const textTarget = `${myData.username} acaba de aceitar seu pedido de conexão! ` +
      'Use o comando /friends para checar.';

    console.log('targetChat', targetChat);
    await client.sendMessage(textTarget, undefined, { chatId: targetChat });

    const myText = `Parabéns! Você acaba de se conectar com ${targetData.username}! ` +
      'Que tal dar um "oi" pra elu? :)\n' +
      'Use o comando /friends para ver a sua nova conexão! Ela estará no final da última página.';

    await client.sendMessage(myText);

    return 'END';
  }
};
