import { ApproximaClient } from '../../services/telegram-bot';
import { CommandStateResolver } from '../../models/command';

export const helpCommand: CommandStateResolver<'help'> = async (
  client: ApproximaClient, _arg?: string
) => {
  /* eslint-disable max-len */
  const helpText = '/prefs --> Retorna uma lista com todas as categorias de interesse. A partir dela, você poderá adicionar ou remover interesses.\n\n' +
  '/show --> Mostra uma pessoa que tem interesses em comum.\n\n' +
  '/random --> Mostra uma pessoa aleatória.\n\n' +
  '/clear --> Permite que as pessoas que você respondeu com "Agora não" apareçam de novo nos dois comandos acima.\n\n' +
  '/pending --> Mostra uma solicitação de conexão que você possui e ainda não respondeu.\n\n' +
  '/friends --> Mostra o contato de todas as pessoas com que você já se conectou.\n\n' +
  '/name --> Troca o seu nome.\n\n' +
  '/desc --> Troca a sua descrição.\n\n' +
  '/help --> Mostra novamente essa lista. Alternativamente, você pode digitar / e a lista de comandos também aparecerá!\n\n\n' +
  'Caso tenha algum problema ou crítica/sugestão, chama um dos meus desenvolvedores (eles me disseram que não mordem) --> @vitorsanc @Lui_Tombo @arenasoy @Angra018 @OliveiraNelson';
  /* eslint-enable max-len */
  client.sendMessage(helpText);
  return 'END' as const;
};
