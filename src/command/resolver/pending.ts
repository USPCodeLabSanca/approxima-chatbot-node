import { CommandStateResolver } from '../../models/command';

interface IPendingContext {
  lastShownId?: number;
}

export const pendingCommand: CommandStateResolver<'pending'> = {
  INITIAL: async (client, arg) => {
    /**
    pending => Mostra todas as solicitações de conexão que aquela pessoa possui e
    para as quais ela ainda não deu uma resposta. Mostra, para cada solicitação,
    a descrição da pessoa e dois botões: conectar ou descartar).
    **/

    const context = client.getCurrentContext<IPendingContext>();

    // facilita na hora de referenciar esse usuario
    const userID = client.userId;

    const myData = await client.db.user.get(userID);

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
    client.db.user.edit(userID, { 'pending': myData.pending });

    // Me retiro da lista de "invited" do outro usuario
    const targetInvited = targetData.invited;
    targetInvited.remove(userID);
    client.db.user.edit(target, { 'invited': targetInvited });

    // MENSAGEM DO BOT

    const keyboard: InlineKeyboardButton[][] = [[
      { text: 'Aceitar', callback_data: 'accept' },
      { text: 'Rejeitar', callback_data: 'reject' }
    ]];

    const text = 'A seguinte pessoa quer se conectar a você:\n\n' +
      `"${targetBio}"`;

    client.sendMessage(text, { reply_markup: { inline_keyboard: keyboard } } );

    return 'CHOOSE_ANSWER_FOR_BUTTONS';
  }
};
