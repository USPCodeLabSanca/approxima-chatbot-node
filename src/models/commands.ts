import { ApproximaClient } from '../services/client';
import { commandsAndStates } from '../data/commands-and-states';

export const commands = Object.keys(commandsAndStates).map(_command => _command.toLowerCase());

export type Command = keyof typeof commandsAndStates;

type StatesOf<T extends Command> = typeof commandsAndStates[T][number];

export type StateResolverFunctionReturn<T extends Command> =
  Promise<StatesOf<T> | 'END'> |
  StatesOf<T> | 'END'

type InitialFunctionResolver<T extends Command> =
  (client: ApproximaClient, arg?: string, originalArg?: string) => StateResolverFunctionReturn<T>

export type StateResolverFunction<T extends Command> =
  (client: ApproximaClient, arg: string, originalArg: string) => StateResolverFunctionReturn<T>

type CommandStateResolverMapper<T extends Command> = {
  [state in StatesOf<T> | 'INITIAL']: state extends 'INITIAL' ?
  InitialFunctionResolver<T> :
  StateResolverFunction<T>
}

export type CommandStateResolver<T extends Command> = StatesOf<T> extends never ?
  CommandStateResolverMapper<T> | InitialFunctionResolver<T> :
  CommandStateResolverMapper<T>

export type CommandExecuter = {
  [command in Command]: CommandStateResolver<command>
}
