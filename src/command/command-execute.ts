import { ICommandExecuter } from '../models/command';
import {
  helpCommand,
  prefsCommand
} from './resolver';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand,
  prefs: prefsCommand,
};
