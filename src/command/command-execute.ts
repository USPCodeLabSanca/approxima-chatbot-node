import { ICommandExecuter } from '../models/command';
import {
  helpCommand,
  prefsCommand,
  showCommand,
  pendingCommand,
  randomCommand
} from './resolver';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  pending: pendingCommand,
  show: showCommand,
  random: randomCommand,
  prefs: prefsCommand,
};
