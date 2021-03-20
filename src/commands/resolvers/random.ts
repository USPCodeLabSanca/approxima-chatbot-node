import { randomInt } from '../../helpers';
import { CommandStateResolver } from '../../models/commands';
import { answerState, confirmState, presentUser } from './common/show-random';
import { IUser } from '../../models/user';

interface IRandomContext {
  user: IUser;
  lastShownId?: number;
	messageId: number;
	bio: string;
}

export const randomCommand: CommandStateResolver<'random'> = {
	INITIAL: async (client, _arg) => {
		/**
    random => Mostra uma pessoa: any aleatória. Embaixo, um botão para enviar a solicitação
    de conexão deve existir, bem como um botão de "agora não".
    **/

		const state = client.getCurrentState<IRandomContext>();
		const currentUser = state.currentUser!;
		const context = state.context;

		// Get all active users (ids) from the DB
		let allUsers;

		try {
			allUsers = await client.db.user.getAll();
		}
		catch (err) {
			console.error(err);
			client.sendMessage(
				'Oops. Parece que houve um erro em nosso servidor. Tente novamente mais tarde. :)'
			);
			client.registerAction('random_person_command', { error: err });
			return 'END';
		}

		const myAllowedUsers = allUsers.filter(otherUser => {
			return otherUser._id !== currentUser._id &&
        !currentUser.invited.includes(otherUser._id) &&
        !currentUser.rejects.includes(otherUser._id) &&
        !currentUser.pending.includes(otherUser._id) &&
        !currentUser.connections.includes(otherUser._id);
		});

		// Preciso, ainda, tirar aqueles que me tem em sua lista de rejects
		const finalAllowedUsers = [];
		for (const user of myAllowedUsers) {
			if (!user.rejects.includes(client.userId)) {
				finalAllowedUsers.push(user);
			}
		}

		if (finalAllowedUsers.length === 0) {
			client.sendMessage(
				'Não tenho ninguém novo para te mostrar no momento... que tal tentar amanhã? :)'
			);

			client.registerAction('random_person_command', { no_one_to_show: true });

			return 'END';
		}

		const target = finalAllowedUsers[randomInt(0, finalAllowedUsers.length)];
		const targetBio = (await client.db.user.get(target._id)).bio;

		// Avisa no contexto que essa pessoa foi a ultima a ser exibida para o usuario (ajuda nas callback queries)
		context.lastShownId = target._id;
		context.bio = targetBio;

		client.registerAction('random_person_command', { success: true, target: target._id });

		return await presentUser(client);
	},

	ANSWER: answerState,
	CONFIRM: confirmState,
};
