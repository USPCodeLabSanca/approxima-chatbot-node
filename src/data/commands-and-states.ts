
export const commandsAndStates = {
	start: ['NAME', 'BIO'],
	help: [],
	clear: [],
	edit: ['SWITCH', 'NEW_NAME', 'NEW_DESC'],
	delete: ['SWITCH', 'DEL_FRIEND', 'DEL_MYSELF'],
	show: ['ANSWER'],
	random: ['ANSWER'],
	pending: ['ANSWER'],
	prefs: ['CHOOSING'],
	friends: ['CHOOSE_PAGE'],
	poke: ['CHOOSE_USER', 'CHOOSE_MODE'],
	notify: ['SEND']
} as const;
