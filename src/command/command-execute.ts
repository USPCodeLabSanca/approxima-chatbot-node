import { ICommandExecuter } from '../models/command';
import {
  helpCommand,
  prefsCommand,
  showCommand,
  pendingCommand,
  randomCommand,
  clearCommand
} from './resolver';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  clear: clearCommand,
  pending: pendingCommand,
  show: showCommand,
  random: randomCommand,
  prefs: prefsCommand,
};
