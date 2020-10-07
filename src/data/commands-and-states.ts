
export const commandsAndStates = {
  start: ['NAME', 'BIO'],
  help: [],
  clear: [],
  edit: ['CHOOSE_EDIT', 'NEW_NAME', 'NEW_DESC'],
  delete: ['CHOOSE_DELETE'],
  show: ['ANSWER'],
  random: ['ANSWER'],
  pending: ['ANSWER'],
  prefs: ['CHOOSING'],
  friends: ['CHOOSE_PAGE'],
  poke: ['CHOOSE_USER', 'CHOOSE_MODE'],
  notify: ['SEND']
} as const;
