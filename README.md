# Parser de Arquivo de Log para Jogos de Quake 3 Arena

Este projeto consiste em um parser desenvolvido para extrair informações relevantes de um arquivo de log gerado pelo servidor de Quake 3 Arena.

O arquivo de log registra todas as atividades ocorridas durante os jogos, incluindo o início e o fim de cada partida, além de detalhes sobre as mortes dos jogadores.

## Funcionalidades

O parser é capaz de:

- Agrupar os dados de cada partida, identificando o início e o fim de cada uma.

- Extrair informações sobre as mortes ocorridas durante cada partida, incluindo quem matou quem e as circunstâncias da morte (por exemplo, queda no vazio, morte por outro jogador, morte por ferimentos etc.).

- Gerar relatórios em JSON que podem ser usados para análise posterior dos jogos.

## Informações Complementares

Além do parser principal, o projeto conta com outros arquivos e funcionalidades importantes:

**index.ts**:
O arquivo index.ts é responsável por orquestrar o funcionamento do parser como um todo.
Ele chama as classes e métodos necessários para realizar a leitura do arquivo de log, processar os dados e gerar os resultados desejados. Um script _npm run index_ está disponível para executar este arquivo usando o Node.js.

**server.ts**:
O arquivo server.ts é responsável por iniciar o servidor da API em Node.js.
Ele configura as rotas definidas no arquivo app.ts e disponibiliza a API para receber requisições dos clientes.

**app.ts**:
arquivo app.ts contém a aplicação da API, onde estão definidas as rotas e controladores responsáveis por lidar com as requisições dos clientes. As rotas são descritas abaixo:

## Rotas

- GET **/games**: Retorna a lista com informações detalhadas de todos os jogos registrados.
- GET **/game/:id**: Retorna as informações de um jogo específico com base no seu game_id.
- GET **/reports**: Retorna um relatório sobre os jogos (somente hash).
- GET **/ranking**: Retorna o ranking dos jogadores com base no número de kills.

## Instalação

No seu terminal rode os seguintes comandos:

```bash
  git clone https://github.com/SrLuc/quake_parse_challenger.git
  cd ./quake_parse_challenger
  npm install

```

### Configuração do Ambiente

Antes de executar o projeto, é necessário configurar algumas variáveis de ambiente.
Para isso, siga os passos abaixo:

Na raiz do seu projeto, crie um arquivo chamado .env

Adicione a seguinte variável de ambiente ao arquivo:

`API_PORT` = 1234

Isto vai definir porta em que o servidor da API será executado.

## Rodando

Para executar a API, rode o comando

```bash
  npm run start
```
