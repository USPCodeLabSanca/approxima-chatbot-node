import { CommandStateResolver } from '../../models/commands';

interface IAdmin {
  name: string;
  telegramId: number;
}

interface INotifyContext {
  admins: IAdmin[];
  isTest: boolean;
}

export const notifyCommand: CommandStateResolver<'notify'> = {
	INITIAL: (client, arg) => {
		let isAdmin = false;
		let adminName = '';

		const state = client.getCurrentState<INotifyContext>();

		state.context.admins = JSON.parse(process.env.ADMINS!);

		if (arg === 'test') {
			state.context.isTest = true;
		}
		else {
			state.context.isTest = false;
		}

		for (const admin of state.context.admins) {
			if (client.userId == admin.telegramId) {
				isAdmin = true;
				adminName = admin.name;
				break;
			}
		}
		if (!isAdmin) {
			const response = 'O que você está tentando fazer? Esse comando é só para admins.';
			client.sendMessage(response);

			return 'END';
		}

		let response;

		if (state.context.isTest) {
			response = `Olá ${adminName}!\n` +
        'Me informe a mensagem DE TESTE que deseja mandar para TODOS os admins do Approxima.';
		}
		else {
			response = `Olá ${adminName}!\n` +
        'Me informe a mensagem que deseja mandar para TODOS os usuários do Approxima.\n' +
        'OBS: Lembre-se de usar esse recurso com responsabilidade!!! :)';
		}

		client.sendMessage(response);

		client.registerAction('notify_command');
		return 'SEND';
	},
	SEND: async (client, _arg, originalArg) => {
		const allUserIds = await client.db.user.getAllIds();

		const { context } = client.getCurrentState<INotifyContext>();

		if (context.isTest) {
			const adminIds = context.admins.map(admin => admin.telegramId);

			for (const userId of adminIds) {
				try {
					client.sendMessage(originalArg, undefined, { chatId: userId });
				}
				catch (error) {
					console.error(`Erro ao interagir com o chat ${userId}: ${error}`);
				}
			}
			// Avisa que esse admin mandou o broadcast
			console.log(
				// eslint-disable-next-line
        `${client.getCurrentState().currentUser.name} mandou uma notificação de TESTE para todos os admins: ${originalArg}`
			);
		}
		else {
			for (const userId of allUserIds) {
				try {
					client.sendMessage(originalArg, undefined, { chatId: userId });
				}
				catch (error) {
					console.error(`Erro ao interagir com o chat ${userId}: ${error}`);
				}
			}
			// Avisa que esse admin mandou o broadcast
			console.log(
				// eslint-disable-next-line
        `${client.getCurrentState().currentUser.name} mandou uma notificação para todos os usuários: ${originalArg}`
			);
		}

		client.registerAction('admin_notified', { 'message': originalArg });

		return 'END' as const;
	}
};
