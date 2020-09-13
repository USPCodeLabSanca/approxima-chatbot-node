import { CommandExecuter } from '../models/commands';
import {
  clearCommand,
  helpCommand,
  pendingCommand,
  prefsCommand,
  randomCommand,
  showCommand
} from './resolvers';

export const commandExecuter: CommandExecuter = {
  help: helpCommand,
  clear: clearCommand,
  pending: pendingCommand,
  show: showCommand,
  random: randomCommand,
  prefs: prefsCommand,
};
