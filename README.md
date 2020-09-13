# Approxima Chatbot (Telegram)

Chatbot de Telegram que será desenvolvido como MVP (Minimum Valueable Product) da iniciativa Approxima

## Depois de clonar o reposotorio

Rode o comando `npm i` para instalar as libs necessárias.
Copie o `.env.template` e renomear para `.env` e colocar as passar as variaveis de ambiente

## Lista de comandos (@approxima_bot)

- /start => (Re)inicia o bot. Se a pessoa não estiver cadastrada na base de dados, pede para ela fornecer um nome, uma pequena descrição pessoal e sugere a ela escolher seus primeiros interesses.

- /prefs => Retorna lista de interesses (caixa de seleção). A pessoa pode marcar ou desmarcar o que ela quiser. O que ela marcar aqui será utilizado pelo algoritmo de rankeamento para encontrar as pessoas mais similares à ela. Até o presente momento, não há a intenção de mostrar os interesses marcados por uma pessoa às outras.

- /show => Mostra a descrição da pessoa mais similar ao usuário, com base nos interesses, e duas opções: "conectar" e "agora não".

- /random => Mostra a descrição de uma pessoa aleatória e duas opções: "conectar" e "agora não".

- [POSSIVEL FEATURE] /opposite => Mostra a descrição de uma pessoa que tem interesses opostos (vai com base no ranking reverso) e duas opções: "conectar" e "agora não".

- /clear => Permite que as pessoas que o usuário respondeu com "agora não" apareçam de novo nas sugestões dele (quando ele responde com "agora não", aquele usuário vai para o campo de "rejeitados", então não irá aparecer como sugestão novamente AO MENOS que ele dê esse comando).

- /pending => Pega a primeira solicitação de conexão da fila de não-respondidas, mostrando a descrição da pessoa e dois botões: "aceitar" ou "rejeitar".

- /friends => Mostra o nome, a descrição e o contato (@ do Telegram) de todas as pessoas com que o usuário já se conectou.

- /name => Troca o nome do usuário.

- /desc => Troca a descrição do usuário.

- /help => Mostra os comandos disponíveis.

## Estrutura do projeto

- **commands**
  - **resolvers**
    - Um arquivo ou pasta com as funções que lidam (resolvem) os comandos
    - **common**
      - Logica comum entre mais de um comando
- **controllers**
  - Interface entre mundo externo e aplicação
- **data**
  - Dados estaticos como as categorias
- **database**
  - **repository**
    - Lida diretamente com o banco
    - Funções gerais: `get, getAll, create, edit`
    - Se formos mudar o banco e resto da aplicação continua funcionando normalmente
  - **controllers**
    - Interface entre o repository do banco e o resto da aplicação
    - Funções especificas: `editarPreferencias, adicionarNovaConexao`
- **helpers**
  - Pequenas funções gerais para ajudar no projeto
- **models**
  - Interfaces que são usadas em mais de um lugar (que tem um export)
  - Interfaces que vão ser usadas só em um arquivo podem ficar no proprio arquivo
- **services**
  - Logica de negocio
  - Scripts/classes com funções especificas
- **tasks**
  - Scripts para teste ou para funções especificas por exemplo: `resetar o banco`
