import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';
import { IUser } from '../../models/user';

interface IAdmin {
  name: string;
  telegramId: number;
}

interface IBlockContext {
    admins: IAdmin[];
    isTest: boolean;
}

interface IChosenUserContext {
	chosenUser: IUser;
}

const handleUserToBlock = async (client: ApproximaClient, username: string | undefined) => {

	const { currentUser, context } = client.getCurrentState<IChosenUserContext>();

	if (username === undefined) return 'CHOICE_USER';

	if (!username.startsWith('@')) {
		/* eslint-disable max-len */
		const reply = 'Você precisa colocar um "@" antes do username para que funcione!\n' +
			'Caso o usuário não possua um username com @ no começo, não será possível realizar essa ação.\n\n' +
			'Envie um ponto (.) caso não queira mais prosseguir com o bloqueio.';
		/* eslint-enable max-len */

		client.sendMessage(reply);
		return 'CHOICE_USER';
	}

	if (currentUser.username === username) {
		client.sendMessage('Você não pode dar poke em si mesmo!');
		return 'CHOICE_USER';
	}

	const user = await client.db.user.getByUsername(username);

	if (!user) {
		client.sendMessage('O usuário solicitado não existe :/\nEnvie sua resposta novamente.\n');
		client.registerAction('block_command', {
			target: username, exists: false
		});

		return 'CHOICE_USER' as const;

	}
	else if (user.blocked === true && user.active === false) {
		client.sendMessage('Usuário ' + user.username + ' já está bloquado.\n\n');

		return 'END';
	}

	context.chosenUser = user;

	//
	const response = 'Digite a mensagem que o usuário sobre o motivo do bloqueio.\n' +
                     'Para deixar em branco, envie uma virgula \',\'.\n\n' +
                     'Envie um ponto (.) caso não queira mais prosseguir com o bloqueio.';

	client.sendMessage(response);

	return 'SEND' as const;
};


export const blockCommand: CommandStateResolver<'block'> = {
	// arg => Nome do usuario que deseja bloquear
	INITIAL: async (client, _arg, originalArg) => {
		let isAdmin = false;

		const state = client.getCurrentState<IBlockContext>();

		// Confere se o user é admin
		state.context.admins = JSON.parse(process.env.ADMINS!);

		for (const admin of state.context.admins) {
			if (client.userId == admin.telegramId) {
				isAdmin = true;
				break;
			}
		}
		if (!isAdmin) {
			const response = 'O que você está tentando fazer? Esse comando é só para admins.';
			client.sendMessage(response);

			return 'END' as const;
		}

		// Se tiver um argumento o usuario ja escolheu alguem para dar poke
		if (originalArg != undefined && originalArg != '') {
			return handleUserToBlock(client, originalArg);
		}

		const response = 'Agora, me fale o username (@algoaqui) do usuário que você quer bloquear!\n' +
			'Envie um ponto (.) caso tenha desistido.';
		client.sendMessage(response);

		return 'CHOICE_USER' as const;
	},
	CHOICE_USER: async (client, arg, originalArg) => {
		if (arg === '.') {
			client.sendMessage('Ok! Não vou prosseguir com o bloqueio.');
			return 'END';
		}
		return handleUserToBlock(client, originalArg);
	},
	SEND: async (client, arg, originalArg) => {
		const { currentUser, context } = client.getCurrentState<IChosenUserContext>();

		if (arg === '.') {
			client.sendMessage('Ok! Não vou prosseguir com o bloqueio.');
			return 'END';
		}

		// Blocking the user and turn it inactive
		client.db.user.edit(context.chosenUser._id, { blocked: true, active: false });
		client.sendMessage(`${currentUser.username}: ` + originalArg,
			undefined,
			{ chatId: context.chosenUser.chat_id });
		client.sendMessage('Bloqueio efetuado.\n');
		client.registerAction('block_command', {
			target: context.chosenUser.username, exists: true
		});
		return 'END' as const;
	}
};
