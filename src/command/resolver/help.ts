import { ApproximaBot } from '../../services/telegram-bot';

export const helpCommand = async (bot: ApproximaBot, _arg?: string) => {
  /* eslint-disable max-len */
  const helpText = '/prefs --> Retorna uma lista com todas as categorias de interesse. A partir dela, você poderá adicionar ou remover interesses.\n' +
  '/show --> Mostra uma pessoa que tem interesses em comum.\n' +
  '/random --> Mostra uma pessoa aleatória.\n' +
  '/clear --> Permite que as pessoas que você respondeu com "Agora não" apareçam de novo nos dois comandos acima.\n' +
  '/pending --> Mostra uma solicitação de conexão que você possui e ainda não respondeu.\n' +
  '/friends --> Mostra o contato de todas as pessoas com que você já se conectou.\n' +
  '/name --> Troca o seu nome.\n' +
  '/desc --> Troca a sua descrição.\n' +
  '/help --> Mostra novamente essa lista. Alternativamente, você pode digitar / e a lista de comandos também aparecerá!\n\n' +
  'Caso tenha algum problema ou crítica/sugestão, chama um dos meus desenvolvedores (eles me disseram que não mordem) --> @vitorsanc @Lui_Tombo @arenasoy @Angra018 @OliveiraNelson';

  bot.sendMessage(helpText, { parse_mode: 'HTML' });
  return 'END' as const;
};
