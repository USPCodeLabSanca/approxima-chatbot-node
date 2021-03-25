import { CommandExecuter } from '../models/commands';
import {
	clearCommand,
	helpCommand,
	pendingCommand,
	prefsCommand,
	editCommand,
	randomCommand,
	showCommand,
	friendsCommand,
	notifyCommand,
	startCommand,
	pokeCommand,
	deleteCommand,
	profileCommand,
	blockCommand,
} from './resolvers';

export const commandExecuter: CommandExecuter = {
	help: helpCommand,
	start: startCommand,
	clear: clearCommand,
	edit: editCommand,
	delete: deleteCommand,
	pending: pendingCommand,
	show: showCommand,
	random: randomCommand,
	prefs: prefsCommand,
	friends: friendsCommand,
	poke: pokeCommand,
	notify: notifyCommand,
	profile: profileCommand,
	block: blockCommand,
};
