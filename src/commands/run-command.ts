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
  }
  else {
    state.currentState = nextState;
    state.currentCommand = command;
  }
};
