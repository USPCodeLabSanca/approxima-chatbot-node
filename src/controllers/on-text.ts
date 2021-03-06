import TelegramBot from 'node-telegram-bot-api';
import {
	commands,
	Command,
} from '../models/commands';
import { runCommand } from '../commands/run-command';
import { ApproximaClient } from '../services/client';
import { IUser } from '../models/user';
import { stateMachine } from '../commands/command-state-machine';

const botName = 'approxima_bot';

const emptyCommandRegex = new RegExp(`^/?(${commands.join('|')})(?:@${botName})? *$`, 'i');
const commandWithArgRegex = new RegExp(`^/?(${commands.join('|')})(?:@${botName})? +(.*)$`, 'i');

const cleanMessage = (message: string): string => {
	if (message.startsWith('/')) {
		message = message.substr(1);
	}
	if (message.endsWith(`@${botName}`)) {
		message = message.substr(0, message.length - `@${botName}`.length);
	}
	return message;
};

export const onText = async (client: ApproximaClient, msg: TelegramBot.Message): Promise<void> => {
	const msgText = msg.text;
	const fromId = msg.from!.id;

	// TODO: logging/report system
	if (msg.reply_to_message) return;
	if (!msgText) {
		console.error('No message text');
		console.log(msg);
		return;
	}
	if (!fromId) {
		console.error('No user id');
		console.log(msg);
		return;
	}

	let user: IUser | undefined;
	try {
		user = await client.db.user.get(client.userId, true); // allow inactive user to be get
	}
	catch {
		console.log(`The following user is not registered: ${client.username}`);
		user = undefined;
	}

	const cleanMsgText = cleanMessage(msgText);

	const state = client.getCurrentState();

	if (state.endKeyboardCommandOnText) {
		const {
			deleteKeyboard,
			keyboardId
		} = state.endKeyboardCommandOnText;

		if (deleteKeyboard && keyboardId) {
			try {
				await client.deleteMessage(state.endKeyboardCommandOnText.keyboardId);
			}
			catch {
				console.log('Error while deleting keyboard from previous command.');
			}
		}

		client.resetCurrentState();
		return;
	}

	state.currentUser = user as IUser;

	if (cleanMsgText == 'debug') {
		const states = Object.entries(stateMachine.stateMachine).map(([id, entry]) => {
			const { currentUser: _currentUser, ...rest } = entry;
			return { id, ...rest };
		});
		console.log(JSON.stringify(states, null, 2));
		client.sendMessage('Deu certo! :)\nAgradecemos pela ajuda!!');
		return;
	}
	else if (cleanMsgText === '.' && state.persistentContext.cancelTimeoutIdOnDot) {
		clearTimeout(state.persistentContext.cancelTimeoutIdOnDot);
		delete state.persistentContext.cancelTimeoutIdOnDot;
		client.sendMessage('Ok! Ação desfeita :)');
		return;
	}

	if (state.currentUser?.active && cleanMsgText === 'reset') {
		client.resetCurrentState();
		// eslint-disable-next-line max-len
		client.sendMessage('Estado resetado com sucesso! Fique tranquile, isso não é um descadastramento :)');
		return;
	}

	const emptyCommandExec = emptyCommandRegex.exec(msgText);
	const commandWithArgExec = commandWithArgRegex.exec(msgText);

	if (state.currentCommand !== '' && state.currentState !== 'INITIAL') {
		runCommand(client, state.currentCommand, cleanMsgText);
	}
	else if (emptyCommandExec) {
		const command = emptyCommandExec[1] as Command;
		runCommand(client, command);
	}
	else if (commandWithArgExec) {
		const command = commandWithArgExec[1] as Command;
		const arg = commandWithArgExec[2];
		runCommand(client, command, cleanMessage(arg));
	}
	else {
		if (!state.currentUser) {
			client.sendMessage('Você precisa se registrar para continuar! Use o /start');
			return;
		}
		else if (!state.currentUser.active) {
			if (!state.currentUser.username) {
				const message = 'Você não pode usar o Approxima sem definir um username do Telegram!\n' +
					'Caso contrário, as outras pessoas não conseguirão conversar com você.\n\n' +
					'Por favor, defina um username (veja mais instruções no comando /start).\n' +
					'Caso já tenha definido um, dê o comando /start para voltar ao Approxima!';

				client.sendMessage(message);
			}
			else {
				client.sendMessage('Você precisa se registrar para continuar! Use o /start');
			}
			return;
		}
		// Command not found
		// eslint-disable-next-line
		client.sendMessage(`Comando \`${cleanMsgText}\` não encontrado!\nUse /help para a lista completa de comandos.`, { parse_mode: 'Markdown' });
	}
};
