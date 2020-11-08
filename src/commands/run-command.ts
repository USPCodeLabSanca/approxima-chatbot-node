import { cleanString } from '../helpers/string';
import { Command, StateResolverFunction } from '../models/commands';
import { ApproximaClient } from '../services/client';
import { commandExecuter } from './command-execute';

export const runCommand = async (
	client: ApproximaClient, command: Command, arg?: string
) => {

	const state = client.getCurrentState();

	if (!state.currentUser && command !== 'start') {
		client.sendMessage('Você precisa se registrar para continuar!');
		return;
	}
	else if (state.currentUser && !state.currentUser.active && command !== 'start') {
		if (!state.currentUser.username) {
			// eslint-disable max-len
			const message = 'Você não pode usar o Approxima sem definir um username do Telegram!\n' +
			'Caso contrário, as outras pessoas não conseguirão conversar com você.\n\n' +
			'Por favor, defina um username (veja mais instruções no comando /start).\n' +
			'Caso já tenha definido um, dê o comando /start para voltar ao Approxima!';
			// eslint-enable max-len

			client.sendMessage(message);
		}
		else {
			client.sendMessage('Você precisa se registrar para continuar!');
		}

		return;
	}

	let stateResolver: StateResolverFunction<Command>;

	if (state.currentState === 'INITIAL' && typeof commandExecuter[command] === 'function') {
		// @ts-ignore
		stateResolver = await commandExecuter[command];
	}
	else {
		// @ts-ignore
		stateResolver = await commandExecuter[command][state.currentState];
	}

	const nextState = await stateResolver(client, cleanString(arg), arg || '');

	if (nextState === 'END') {
		state.currentState = 'INITIAL';
		state.currentCommand = '';
		clearTimeout(state.callbackTimeoutId);
		state.callbackTimeoutId = undefined;
	}
	else {
		state.currentState = nextState;
		state.currentCommand = command;
	}
};
