import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';

interface IEditContext {
	messageId?: number;
	currentName?: string;
	currentDesc?: string;
}

const changeName = (client: ApproximaClient, newName: string, oldName: string) => {
	if (newName == oldName) {
		client.sendMessage('Esse ja é seu nome kk');
		return;
	}
	client.registerAction('edit_command', { type: 'name', changed: true, new_name: newName });
	client.db.user.edit(client.userId, { name: newName });
	client.sendMessage('Seu nome foi alterado com sucesso!');
};

const changeDesc = (client: ApproximaClient, newDesc: string, oldDesc: string) => {
	if (newDesc === oldDesc) {
		client.sendMessage('Essa já é sua descrição kk');
		return;
	}
	client.registerAction('edit_command', { type: 'description', changed: true, new_desc: newDesc });
	client.db.user.edit(client.userId, { bio: newDesc });
	client.sendMessage('Sua descrição foi alterado com sucesso!');
};

export const editCommand: CommandStateResolver<'edit'> = {
	INITIAL: async (client, _arg) => {
		const { context } = client.getCurrentState<IEditContext>();

		const keyboard = [[
			{ text: 'NOME', callback_data: 'name' },
			{ text: 'DESCRIÇÃO', callback_data: 'desc' }
		]];

		const response = 'Escolha abaixo qual informação sua você quer editar:';

		const message = await client.sendMessage(
			response, { reply_markup: { inline_keyboard: keyboard } }
		);

		context.messageId = message.message_id;

		return 'SWITCH' as const;
	},
	SWITCH: async (client, arg) => {
		const { currentUser, context } = client.getCurrentState<IEditContext>();
		const lastMessageId = context.messageId;

		if (!lastMessageId) {
			throw Error('There should be an lastMessageId here in SWITCH state of edit command');
		}

		if (arg === 'name') {
			const response = `Seu nome atual é: ${currentUser.name} \n\n` +
				'Agora, manda pra mim o seu novo nome! Envie um ponto (.) caso tenha desistido de mudá-lo.';
			client.sendMessage(response);

			client.deleteMessage(lastMessageId);
			return 'NEW_NAME';
		}
		else if (arg === 'desc') {
			const response = `Sua descrição atual é: \n\n${currentUser.bio}\n\n` +
				'Agora, manda pra mim a sua nova descrição!\n' +
				'Envie um ponto (.) caso tenha desistido de mudá-la.';
			client.sendMessage(response);

			client.deleteMessage(lastMessageId);
			return 'NEW_DESC';
		}

		// Else: usuario mandou lixo
		const response = 'Você deve decidir a sua ação antes de prosseguir.\n\n' +
			'Não se preocupe! Você não será obrigade a mudar sua informação :)';

		client.sendMessage(
			response,
			undefined,
			{
				selfDestruct: 10000,
			}
		);
		return 'SWITCH';
	},
	NEW_NAME: (client, arg, originalArg) => {
		if (arg === '.') {
			client.sendMessage('Ok! Não vou alterar seu nome.');
			client.registerAction('edit_command', { type: 'name', changed: false });
			return 'END';
		}

		const currentName = client.getCurrentState<IEditContext>().context.currentName!;
		changeName(client, originalArg, currentName);
		return 'END';
	},
	NEW_DESC: (client, arg, originalArg) => {
		if (arg === '.') {
			client.sendMessage('Ok! Não vou alterar seu descrição.');
			client.registerAction('edit_command', { type: 'description', changed: false });
			return 'END';
		}

		const { currentUser } = client.getCurrentState<IEditContext>()!;
		changeDesc(client, originalArg, currentUser.bio);
		return 'END';
	}
};
