import { ICommandExecuter } from '../models/command';
import {
  helpCommand,
  prefsCommand,
  showCommand,
  pendingCommand
} from './resolver';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  pending: pendingCommand,
  show: showCommand,
  prefs: prefsCommand,
};
