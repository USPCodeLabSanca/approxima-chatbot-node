import { CommandStateResolver } from '../../models/commands';

export const advertCommand: CommandStateResolver<'advert'> = {
	INITIAL: async (client) => {
		client.registerAction('advert_command');
		return 'MESSAGE' as const;
	},
	MESSAGE: async () => {
		return 'END' as const;
	}
};
