import { CommandStateResolver } from '../../models/commands';

/**
Deleta o array de pessoas que o usuario já rejeitou,
permitindo que elas apareçam novamente nas buscas
**/
export const clearCommand: CommandStateResolver<'clear'> = {
	INITIAL: async (client, _arg) => {
		const keyboard = [
			[{ text: 'SIM', callback_data: 'yes' }, { text: 'NÃO', callback_data: 'no' }],
		];

		const response = 'Você tem certeza de que deseja limpar a sua lista de "rejeitades"?';

		await client.sendMessage(
			response, { reply_markup: { inline_keyboard: keyboard } }
		);

		return 'CONCLUSION' as const;
	},
	CONCLUSION: async (client, arg) => {
		const { currentUser } = client.getCurrentState();

		if (arg === 'yes') {
			client.registerAction('clear_rejects_command', { confirmed: true });

			if (currentUser.rejects.length == 0) {
				client.sendMessage(
					'Você não "rejeitou" ninguém por enquanto.');
				return 'END';
			}
			currentUser.rejects = [];
			client.db.user.edit(currentUser._id, { rejects: [] });

			client.deleteMessage();
			client.sendMessage('Tudo certo! Sua lista de "rejeitades" foi limpa!');
			return 'END' as const;
		}
		else if (arg === 'no') {
			client.deleteMessage();
			client.sendMessage('Tudo bem! Não vou fazer nada :)');
			return 'END' as const;
		}

		// Else: usuario mandou lixo
		const response = 'Você deve decidir a sua ação antes de prosseguir.';

		client.sendMessage(
			response,
			undefined,
			{
				selfDestruct: 10000,
			}
		);
		return 'CONCLUSION';
	}
};
