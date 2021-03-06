import { ApproximaClient } from '../../services/client';
import { CommandStateResolver } from '../../models/commands';

export const helpCommand: CommandStateResolver<'help'> = (
	client: ApproximaClient,
	_arg?: string
) => {

	client.registerAction('help_command');

	/* eslint-disable max-len */
	const helpText =
    '/profile --> Mostra as informações do seu perfil.\n\n' +
    '/prefs --> Retorna uma lista com todas as categorias de interesse. A partir dela, você poderá adicionar ou remover interesses.\n\n' +
    '/prefs @arroba_da_conexao --> Lista os interesses em comum que você tem com uma de suas conexões.\n\n' +
    '/show --> Mostra uma pessoa que tem interesses em comum.\n\n' +
    '/random --> Mostra uma pessoa aleatória.\n\n' +
    '/clear --> Permite que as pessoas que você respondeu com "Agora não" apareçam de novo nos dois comandos acima.\n\n' +
    '/pending --> Mostra uma solicitação de conexão que você possui e ainda não respondeu.\n\n' +
    '/friends --> Mostra o contato de todas as pessoas com que você já se conectou.\n\n' +
    '/poke --> Permite a você manifestar a sua intenção em conversar com alguém da sua lista de conexões. Existem dois modos, sendo um anônimo.\n\n' +
    '/edit --> Permite a você trocar seu nome e/ou sua descrição.\n\n' +
    '/delete --> Permite a você deletar uma conexão ou descadastrar-se da plataforma.\n\n' +
    '/help --> Mostra novamente essa lista. Alternativamente, você pode digitar / e a lista de comandos também aparecerá!\n\n' +
    'Em qualquer momento você pode resetar o estado do bot mandando /reset.\n' +
    '⚠️ ATENÇÃO ⚠️  Este comando não irá resetar o seu registro no bot, apenas irá limpar seu estado atual nele para te livrar de eventuais bugs.\n\n' +
    'Caso tenha algum problema ou crítica/sugestão, chama um dos meus desenvolvedores (eles me disseram que não mordem) --> @vitorsanc @Lui_Tombo @arenasoy @Angra018 @OliveiraNelson';
	/* eslint-enable max-len */
	client.sendMessage(helpText);
	return 'END';
};
