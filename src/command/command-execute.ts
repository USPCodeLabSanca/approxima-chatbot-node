import { ICommandExecuter } from '../models/command';
import {
  helpCommand
} from './resolver';

export const commandExecuter: ICommandExecuter = {
  help: helpCommand
};
