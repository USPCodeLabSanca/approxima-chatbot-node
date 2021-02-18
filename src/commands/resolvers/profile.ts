import { ApproximaClient } from '../../services/client';
import { CommandStateResolver } from '../../models/commands';

export const profileCommand: CommandStateResolver<'profile'> = (
	client: ApproximaClient,
	_arg?: string
) => {

    client.registerAction('profile_command');
    
    const {username, name, bio} = client.getCurrentState().currentUser;
	/* eslint-disable max-len */
    const profileText =
    `Seu nome é: ${name}\n\n` +
    `Seu username (@ do Telegram) é: ${username}\n\n` +
    `Sua descrição é:\n"${bio}"`
    
	/* eslint-enable max-len */
	client.sendMessage(profileText);
	return 'END';
};