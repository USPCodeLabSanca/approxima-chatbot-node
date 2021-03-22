import { ApproximaClient } from '../../../services/client';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { msInASecond } from '../../../helpers/date';

export const answerState = async (
	client: ApproximaClient, arg: string
): Promise<'ANSWER' | 'CONFIRM'> => {

	const {
		context,
	} = client.getCurrentState<{ lastShownId?: number, messageId: number, decision?: string }>();

	const targetId = context.lastShownId;

	if (!targetId) {
		throw Error('There should be an targetId here in ANSWER state of show/random command');
	}

	if (arg === 'dismiss' || arg === 'connect') {
		context.decision = arg;

		const keyboard: InlineKeyboardButton[][] = [[
			{ text: 'Confirmar', callback_data: 'confirm' },
			{ text: 'Cancelar', callback_data: 'cancel' }
		]];

		const decisionName = arg === 'connect' ? 'CONECTAR' : 'AGORA NÃO';
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
};



export const confirmState = async (
	client: ApproximaClient, arg: string
): Promise<'END' | 'CONFIRM'> => {

	const {
		context,
		currentUser,
	} = client.getCurrentState<{ lastShownId?: number, messageId: number, decision?: string }>();

	const targetId = context.lastShownId;
	const messageId = context.messageId;
	const decision = context.decision;

	if (!targetId) {
		throw Error('There should be an targetId here in CONFIRM state of show/random command');
	}

	if (!messageId) {
		throw Error('There should be an messageId here in CONFIRM state of show/random command');
	}

	if (arg === 'confirm') {
		if (decision === 'dismiss') {
			currentUser.rejects.push(targetId);

			// Saves in DB
			client.db.user.edit(client.userId, { 'rejects': currentUser.rejects });
			client.registerAction('answered_suggestion', { target: targetId, answer: arg });

			client.sendMessage('Sugestão rejeitada.');

			client.deleteMessage(messageId);
			return 'END';
		}
		else if (decision === 'connect') {
			currentUser.invited.push(targetId);

			// Update my info on BD
			client.db.user.edit(client.userId, { 'invited': currentUser.invited });
			client.registerAction('answered_suggestion', { target: targetId, answer: arg });

			// Now, let's update info from the target user
			const targetData = await client.db.user.get(targetId);
			targetData.pending.push(client.userId);

			client.db.user.edit(targetId, { 'pending': targetData.pending });

			// Send messages confirming the action
			const targetMsg = 'Você recebeu uma nova solicitação de conexão!\n' +
				'Utilize o comando /pending para vê-la.';

			const targetChat = targetData['chat_id'];

			client.sendMessage(targetMsg, undefined, { chatId: targetChat });
			client.sendMessage('Solicitação enviada :)');

			client.deleteMessage(messageId);
			return 'END';
		}
	}
	else if (arg === 'cancel') {
		client.deleteMessage(messageId);
		return await presentUser(client);
	}

	client.sendMessage(
		'Você deve se decidir antes de prosseguir.',
		undefined,
		{
			selfDestruct: 3 * msInASecond,
		}
	);

	return 'CONFIRM';
};

export const presentUser = async (
	client: ApproximaClient
): Promise<'ANSWER'> => {

	const {
		context,
	} = client.getCurrentState<{ bio?: string, messageId?: number }>();

	const targetBio = context.bio;

	if (!targetBio) {
		throw Error('There should be a bio here in PRESENT state of show/random command');
	}

	const keyboard = [[
		{ text: 'Conectar', callback_data: 'connect' },
		{ text: 'Agora não', callback_data: 'dismiss' }
	]];

	const text = `"${targetBio}"`;

	const message = await client.sendMessage(
		text, { reply_markup: { inline_keyboard: keyboard } }
	);

	context.messageId = message.message_id;

	return 'ANSWER';
};
