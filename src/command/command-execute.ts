import { ICommandExecuter } from '../models/command';
import {
  helpCommand,
  prefsCommand,
  showCommand
} from './resolver';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  show: showCommand,
  prefs: prefsCommand,
};
