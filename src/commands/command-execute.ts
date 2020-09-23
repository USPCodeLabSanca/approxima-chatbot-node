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
  friendsCommand,
  startCommand
} from './resolvers';

export const commandExecuter: CommandExecuter = {
  help: helpCommand,
  start: startCommand,
  clear: clearCommand,
  name: nameCommand,
  desc: bioCommand,
  pending: pendingCommand,
  show: showCommand,
  random: randomCommand,
  prefs: prefsCommand,
  friends: friendsCommand
};
