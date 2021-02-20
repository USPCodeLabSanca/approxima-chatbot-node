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
	advertCommand,
	startCommand,
	pokeCommand,
	deleteCommand,
	profileCommand
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
	advert: advertCommand,
	profile: profileCommand
};
