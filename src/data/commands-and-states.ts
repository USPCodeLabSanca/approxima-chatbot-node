
export const commandsAndStates = {
  start: ['NAME', 'BIO'],
  help: [],
  clear: [],
  name: ['NEW_NAME'],
  desc: ['NEW_BIO'],
  show: ['ANSWER'],
  random: ['ANSWER'],
  pending: ['ANSWER'],
  prefs: ['CHOOSING'],
  friends: ['CHOOSE_PAGE']
} as const;
