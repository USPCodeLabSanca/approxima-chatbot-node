import { CommandExecuter } from '../models/commands';
import {
  clearCommand,
  helpCommand,
  pendingCommand,
  prefsCommand,
  nameCommand,
  bioCommand,
  randomCommand,
  showCommand,
  friendsCommand
} from './resolvers';

export const commandExecuter: CommandExecuter = {
  help: helpCommand,
  clear: clearCommand,
  name: nameCommand,
  bio: bioCommand,
  pending: pendingCommand,
  show: showCommand,
  random: randomCommand,
  prefs: prefsCommand,
  friends: friendsCommand
};
