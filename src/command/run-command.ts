import { normaliseString } from '../helpers/string';
import { Command, StateResolverFunction } from '../models/command';
import { ApproximaBot } from '../services/telegram-bot';
import { commandExecuter } from './command-execute';

export const runCommand = async (
  bot: ApproximaBot, command: Command, arg?: string
) => {

  const state = bot.getCurrentState();
  let stateResolver: StateResolverFunction<Command>;


  if (state.currentState === 'INITIAL' && typeof commandExecuter[command] === 'function') {
    // @ts-ignore
    stateResolver = await commandExecuter[command];
  }
  else {
    // @ts-ignore
    stateResolver = await commandExecuter[command][state.currentState];
  }

  const nextState = await stateResolver(bot, normaliseString(arg));

  if (nextState === 'END') {
    state.currentState = 'INITIAL';
    state.currentCommand = '';
  }
  else {
    state.currentState = nextState;
    state.currentCommand = command;
  }
};
