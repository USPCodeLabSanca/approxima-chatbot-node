import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CommandStateResolver } from '../../models/commands';
import { IUser } from '../../models/user';
import { ApproximaClient } from '../../services/client';

interface IPokeContext {
	pokedUser: IUser;
	messageId: number;
}

const handleUserToPoke = async (client: ApproximaClient, username: string) => {
	const { currentUser, context } = client.getCurrentState<IPokeContext>();

	if (!username.startsWith('@')) {
		/* eslint-disable max-len */
		const reply = 'Você precisa colocar um "@" antes do username para que funcione!\n' +
			'Caso o usuário não possua um username com @ no começo, não será possível realizar essa ação.\n\n' +
			'Envie um ponto (.) caso não queira mais prosseguir com o poke.';
		/* eslint-enable max-len */

		client.sendMessage(reply);
		return 'CHOOSE_USER';
	}

	if (currentUser.username === username) {
		client.sendMessage('Você não pode dar poke em si mesmo!');
		return 'CHOOSE_USER';
	}

	const user = await client.db.user.getByUsername(username);

	if (!user) {
		client.sendMessage('O usuário solicitado não existe :/');
		client.registerAction('poke_command', {
			target: username, exists: false
		});

		return 'CHOOSE_USER';
	}

	context.pokedUser = user;
	const message = await sendChooseModeMessage(client);
	context.messageId = message.message_id;
	return 'CHOOSE_MODE';
};

const sendChooseModeMessage = (client: ApproximaClient) => {
	/* eslint-disable max-len */
	const response = 'Você tem duas opções:\n' +
		'- Esperar que essa pessoa também dê o comando /poke e direcione-o a você (ela não saberá que você deu o comando), o que pode não acontecer;\n' +
		'- Notificar a pessoa que você deu o comando /poke e o direcionou a ela (ou seja, avisando que você quer conversar), o que aumenta a chance de vocês conversarem.\n\n' +
		'Qual você quer usar?';
	/* eslint-enable max-len */

	const keyboard: InlineKeyboardButton[][] = [
		[
			{
				text: 'Notificar',
				callback_data: 'on_the_face'
			},
			{
				text: 'Esperar',
				callback_data: 'anonymous'
			}
		]
	];

	return client.sendMessage(response, {
		reply_markup: {
			inline_keyboard: keyboard
		}
	});
};

export const pokeCommand: CommandStateResolver<'poke'> = {
	INITIAL: async (client, _arg, originalArg) => {
		// Se tiver um argumento o usuario ja escolheu alguem para dar poke
		if (originalArg) {
			return handleUserToPoke(client, originalArg);
		}

		const response = 'Agora, me fale o username (@algoaqui) do usuário que você quer "pokear"!\n' +
			'Envie um ponto (.) caso tenha desistido.';
		client.sendMessage(response);
		return 'CHOOSE_USER';
	},
	CHOOSE_USER: async (client, arg, originalArg) => {
		if (arg === '.') {
			client.sendMessage('Ok! Não vou prosseguir com o poke.');
			return 'END';
		}
		return handleUserToPoke(client, originalArg);
	},
	CHOOSE_MODE: (client, arg) => {
		const {
			currentUser,
			context: { pokedUser, messageId }
		} = client.getCurrentState<IPokeContext>();

		// Escolher poke publico ou anonimo
		if (arg !== 'anonymous' && arg !== 'on_the_face') {
			client.sendMessage(
				'Você deve decidir a sua ação acima antes de prosseguir.',
				undefined,
				{ selfDestruct: 3000 }
			);
			return 'CHOOSE_MODE';
		}

		client.deleteMessage(messageId);

		if (arg === 'anonymous') {
			currentUser.pokes ||= [];
			if (currentUser.pokes.includes(pokedUser._id)) {
				/* eslint-disable max-len */
				const response = 'Você já deu poke nessa pessoa!\n' +
					'Se não quiser esperar que ela também dê o /poke em você, que tal enviar outro /poke utilizando, agora, o modo "notificar"? :)';
				/* eslint-enable max-len */
				client.sendMessage(response);
				return 'END';
			}

			// Register poke in DB
			currentUser.pokes.push(pokedUser._id);
			client.db.user.edit(currentUser._id, {
				pokes: currentUser.pokes
			});

			client.registerAction('poke_command', {
				target: pokedUser.username, exists: true, poke_mode: 'await'
			});

			// Checar se aquele usuario ja deu poke em mim. Se tiver dado, avisa nós dois
			if (pokedUser.pokes?.includes(currentUser._id)) {
				// eslint-disable-next-line
				const replyToPoker = `${pokedUser.username} já tinha te "pokeado"! Ebaaa! Bora conversar :D`;
				client.sendMessage(replyToPoker);

				const replyToPoked = `${currentUser.username} te "pokeou" de volta! Bora papear :D`;
				client.sendMessage(replyToPoked, undefined, { chatId: pokedUser._id });
			}
			else {
				const reply = `${pokedUser.username} foi "pokeado" com sucesso!\n` +
					'Se elu te "pokear" de volta eu venho correndo te avisar ;)';
				client.sendMessage(reply);
			}
		}
		else {
			// eslint-disable-next-line
			client.sendMessage(`${pokedUser.username} foi notificado de que você quer conversar com elu!`);

			// Send message to poked user

			/* eslint-disable max-len */
			const messageToPoked = `Voce recebeu um poke de ${currentUser.username}!\n` +
				'Que tal chamar elu para conversar? :)\n\n' +
				'Caso não se sinta confortável, você pode dar outro /poke e ver se elu vai te chamar, ao invés.';
			/* eslint-enable max-len */

			client.sendMessage(
				messageToPoked,
				undefined,
				{ chatId: pokedUser._id }
			);

			client.registerAction('poke_command', {
				target: pokedUser.username, exists: true, poke_mode: 'notify'
			});
		}

		return 'END';
	}
};
