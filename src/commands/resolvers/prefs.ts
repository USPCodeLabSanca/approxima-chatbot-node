import { getCommomCategoriesNamesById } from '../../data/categories';
import { CommandStateResolver } from '../../models/commands';
import {
	buildKeyboard,
	IPrefsContext,
	keyboardResponseText,
	chooseState
} from './common/prefs';

export const prefsCommand: CommandStateResolver<'prefs'> = {
	INITIAL: async (client, _arg, originalArg) => {

		const { context, currentUser } = client.getCurrentState<IPrefsContext>();
		context.interests = currentUser.interests;
		context.isRegistering = false;

		if (originalArg) {
			!originalArg.startsWith('@') && (originalArg = '@' + originalArg);

			const user = await client.db.user.getByUsername(originalArg);

			if (!user || !user.connections.find((connection) => connection === currentUser._id)) {
				const message = 'Você não possui essa pessoa na sua lista de conexões.\n' +
					'Tem certeza de que digitou o username correto?';
				client.sendMessage(message);
				return 'END';
			}

			const commomInterests = user.interests.filter((interest) =>
				currentUser.interests.find(currentUserInterest => currentUserInterest === interest)
			);

			if (commomInterests.length > 0) {
				const replyText = `Aqui estão seus interesses em comum\n` +
					`${getCommomCategoriesNamesById(commomInterests)}`;
				client.sendMessage(replyText);
			}
			else {
				const replyText = `Vocês não tem interesses em comum :(\n` +
					`Você pode atualizar seus interesses com o /prefs)`;
				client.sendMessage(replyText);
			}
			return 'END';
		}

		const keyboard = buildKeyboard(context);
		client.sendMessage(keyboardResponseText, {
			reply_markup: {
				inline_keyboard: keyboard
			}
		});

		return 'CHOOSING' as const;
	},
	CHOOSING: (client, arg, originalArg) =>
		chooseState(client, arg, originalArg, 'CHOOSING', 'END') as any
};
