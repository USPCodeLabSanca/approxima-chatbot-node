
export const commandsAndStates = {
	start: ['NAME', 'CHOOSE_PREFS', 'DESC'],
	help: [],
	clear: ['CONCLUSION'],
	edit: ['SWITCH', 'NEW_NAME', 'NEW_DESC'],
	delete: ['SWITCH', 'DEL_FRIEND', 'DEL_MYSELF'],
	show: ['ANSWER', 'CONFIRM'],
	random: ['ANSWER', 'CONFIRM'],
	pending: ['ANSWER', 'CONFIRM'],
	prefs: ['CHOOSING'],
	friends: ['CHOOSE_PAGE'],
	poke: ['CHOOSE_USER', 'CHOOSE_MODE'],
	notify: ['SEND'],
	profile: []
} as const;
