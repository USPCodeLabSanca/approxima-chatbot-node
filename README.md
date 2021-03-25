# Approxima Chatbot (Telegram)

Chatbot de Telegram que será desenvolvido como MVP (Minimum Valueable Product) da iniciativa Approxima, que tem como objetivo conectar estudantes universitáries com interesses em comum.

## Depois de clonar o repositório

Rode o comando `npm install` para instalar os pacotes necessários.
Copie o `.env.template` e renomeie para `.env`, colocando as variáveis de ambiente corretamente.

Para rodar no ambiente de testes, utilize `npm run dev` (irá funcionar como o Nodemon, então a toda mudança salva no código o bot irá reiniciar) OU `npm start` (caso faça alguma modificação no código, deverá matar o bot no Ctrl + C e rodar novamente o comando).

## Lista de comandos (@approxima_bot)

- /start => (Re)inicia o bot. Se a pessoa não estiver cadastrada na base de dados, pede para ela fornecer um nome, seus primeiros interesses e uma pequena descrição pessoal.

- /prefs => Retorna lista de interesses (caixa de seleção). A pessoa pode marcar ou desmarcar o que ela quiser. O que ela marcar aqui será utilizado pelo algoritmo de rankeamento para encontrar as pessoas mais similares à ela.

- /prefs @username => Mostra os interesses em comum que o usuário tem com uma de suas conexões.

- /show => Mostra a descrição da pessoa mais similar ao usuário, com base nos interesses, e duas opções: "conectar" e "agora não".

- /random => Mostra a descrição de uma pessoa aleatória e duas opções: "conectar" e "agora não".

- [POSSIVEL FEATURE] /opposite => Mostra a descrição de uma pessoa que tem interesses opostos (vai com base no ranking reverso) e duas opções: "conectar" e "agora não".

- /clear => Permite que as pessoas que o usuário respondeu com "agora não" apareçam de novo nas sugestões dele (quando ele responde com "agora não", aquele usuário vai para o campo de "rejeitados", então não irá aparecer como sugestão novamente AO MENOS que ele dê esse comando).

- /pending => Pega a primeira solicitação de conexão da fila de não-respondidas, mostrando a descrição da pessoa e dois botões: "aceitar" ou "rejeitar".

- /friends => Mostra o nome, a descrição e o contato (@ do Telegram) de todas as pessoas com que o usuário já se conectou.

- /friends last => Mostra o nome, a descrição e o contado do amigo mais recente.

- /poke => Permite ao usuário declarar seu interesse em conversar com uma conexão. Esse comando possui dois funcionamentos: no primeiro, o alvo é notificado; no segundo, o poke fica "escondido" e o alvo só irá saber que o recebeu se também der o /poke no usuário remetente. Caso isso aconteça, sabe-se que ambos tem interesse mútuo em conversar, então ambos serão notificados.

- /delete => Permite ao usuário remover uma conexão da sua lista ou se descadastrar do bot, parando de receber mensagens do mesmo.

- /edit => Permite ao usuário trocar seu nome ou descrição.

- /reset => Reseta o estado do bot (útil para sair de bugs).

- /help => Mostra os comandos disponíveis.

-  ### Admin-Only

- /advert @username => Envia uma advertência para um usuário alvo. Ao receber 3, a conta dele será bloquada 

- /block @username => Bloqueia um usário, impedindo o de usar sua conta ou recria-la.

automaticamente. 

## Estrutura do projeto

- **commands**
  - **resolvers**
    - Um arquivo ou pasta com as funções que lidam (resolvem) os comandos
    - **common**
      - Logica comum entre mais de um comando
- **controllers**
  - Interface entre mundo externo e aplicação
- **data**
  - Dados estaticos, como as categorias
- **database**
  - **repositories**
    - Lida diretamente com o banco
    - Funções gerais: `get, getAll, create, edit`
    - Se formos mudar o banco, o resto da aplicação continua funcionando normalmente
  - **controllers**
    - Interface entre o repository do banco e o resto da aplicação
    - Funções especificas: `removeReferencesOf, registerAction` etc.
- **helpers**
  - Pequenas funções gerais para ajudar no projeto
- **models**
  - Interfaces que são usadas em mais de um lugar (que tem um export). Interfaces que vão ser usadas só em um arquivo podem ficar no próprio arquivo.
- **services**
  - Lógicas de negócio
  - Scripts/classes com funções especificas
- **tasks**
  - Scripts para teste ou para funções especificas. Por exemplo, uma função para resetar o banco ou dar update nos usernames de todos os usuários.
