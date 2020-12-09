import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { removeByValue } from '../../helpers/array';
import { CommandStateResolver } from '../../models/commands';
import { IUser } from '../../models/user';
import { msInASecond } from '../../helpers/date';

interface IPendingContext {
	lastShownId?: number;
	targetData?: IUser;
	messageId: number;
	decision?: string;
}

export const pendingCommand: CommandStateResolver<'pending'> = {
	INITIAL: async (client, _arg) => {
		/**
		pending => Mostra todas as solicitações de conexão que aquela pessoa possui e
		para as quais ela ainda não deu uma resposta. Mostra, para cada solicitação,
		a descrição da pessoa e dois botões: 'conectar' ou 'agora não').
		**/

		const {
			context,
			currentUser
		} = client.getCurrentState<IPendingContext>();

		if (currentUser.pending.length === 0) {
			client.sendMessage('Você não possui novas solicitações de conexão.');

			client.registerAction('pending_command', { no_one_to_show: true });

			return 'END';
		}

		// Pego o primeiro elemento na "fila"
		const target = currentUser.pending.pop()!;

		let targetData;
		try {
			targetData = await client.db.user.get(target);
		}
		catch (err) {
			client.sendMessage('Erro ao pegar a lista de solicitações. Tente novamente em instantes.');
			return 'END';
		}

		// Avisa no contexto que essa pessoa foi a ultima a ser exibida para o usuario (ajuda nas callback queries)
		context.lastShownId = target;
		context.targetData = targetData;

		const keyboard: InlineKeyboardButton[][] = [[
			{ text: 'Aceitar', callback_data: 'accept' },
			{ text: 'Rejeitar', callback_data: 'reject' }
		]];

		const text = 'A seguinte pessoa quer se conectar a você:\n\n' +
			`"${targetData.bio}"`;

		const message = await client.sendMessage(text, { reply_markup: { inline_keyboard: keyboard } });
		context.messageId = message.message_id;

		client.registerAction('pending_command', { success: true, target });

		return 'ANSWER';
	},
	ANSWER: async (client, arg) => {
		const {
			context,
		} = client.getCurrentState<IPendingContext>();

		const targetId = context.lastShownId;

		if (!targetId) {
			throw Error('There should be a lastShownId in ANSWER state in pending command');
		}

		if (arg === 'reject' || arg === 'accept') {
			context.decision = arg;

			const keyboard: InlineKeyboardButton[][] = [[
				{ text: 'Confirmar', callback_data: 'confirm' },
				{ text: 'Cancelar', callback_data: 'cancel' }
			]];

			const decisionName = arg === 'accept' ? 'ACEITAR' : 'REJEITAR';
			const replyText = `Sua decisão foi ${decisionName}.\nVocê a confirma?`;

			const message = await client.sendMessage(
				replyText, {
					reply_markup: { inline_keyboard: keyboard }
				}
			);

			client.deleteMessage(context.messageId);

			context.messageId = message.message_id;

			return 'CONFIRM';
		}

		const replyText = 'Você deve decidir a sua ação acerca do usuário acima antes de prosseguir.';
		client.sendMessage(replyText, undefined, { selfDestruct: msInASecond * 3 });

		return 'ANSWER';
	},

	CONFIRM: async (client, arg) => {
		const {
			context,
			currentUser,
		} = client.getCurrentState<IPendingContext>();

		const targetId = context.lastShownId;
		const messageId = context.messageId;
		const decision = context.decision;

		if (!targetId) {
			throw Error('There should be a lastShownId in CONFIRM state in pending command');
		}

		if (!messageId) {
			throw Error('There should be a messageId in CONFIRM state in pending command');
		}


		function correctPendingAndInvited() {
			// Salvo no BD o novo array de 'pending'
			client.db.user.edit(client.userId, { 'pending': currentUser.pending });

			// Me retiro da lista de "invited" do outro usuario
			const targetInvited = context.targetData!.invited;
			delete context.targetData;
			removeByValue(targetInvited, client.userId);

			client.db.user.edit(targetId!, { 'invited': targetInvited });
		}


		if (arg === 'confirm') {
			if (decision === 'reject') {
				correctPendingAndInvited();

				client.registerAction('answered_pending', { target: targetId, answer: arg });
				currentUser.rejects.push(targetId);

				// Saves in DB
				client.db.user.edit(client.userId, { 'rejects': currentUser.rejects });

				await client.sendMessage('Pedido de conexão rejeitado.');
				client.deleteMessage(messageId);

				return 'END';
			}
			else if (decision === 'accept') {
				correctPendingAndInvited();

				client.registerAction('answered_pending', { target: targetId, answer: arg });

				// Register the new connection
				currentUser.connections.unshift(targetId);

				// Update my info on BD
				client.db.user.edit(client.userId, { 'connections': currentUser.connections });

				// Update their info on BD

				const targetData = await client.db.user.get(targetId);

				targetData.connections.unshift(client.userId);

				client.db.user.edit(targetId, { 'connections': targetData.connections });

				// Send messages confirming the action

				const targetChat = targetData._id;

				const textTarget = `${currentUser.username} acaba de aceitar seu pedido de conexão! ` +
					'Use o comando /friends para checar.';

				await client.sendMessage(textTarget, undefined, { chatId: targetChat });

				const myText = `Parabéns! Você acaba de se conectar com ${targetData.username}! ` +
				'Que tal dar um "oi" pra elu? :)\n' +
				'Use o comando /friends para ver a sua nova conexão! ' +
				'Ela estará no começo da primeira página.';

				await client.sendMessage(myText);

				client.deleteMessage(messageId);
				return 'END';
			}
		}
		else if (arg === 'cancel') {
			client.sendMessage('Ok! Ação desfeita :)');
			client.deleteMessage(messageId);
			return 'END';
		}

		client.sendMessage(
			'Você deve se decidir antes de prosseguir.',
			undefined,
			{
				selfDestruct: 3 * msInASecond,
			}
		);

		return 'CONFIRM';
	}
};
