# 🍕 Cozinha da Hanna — Restaurante Divertido

**Jogar:** https://lrm-lgtm.github.io/cozinha-da-hanna/

## Missões dentro do restaurante

As **24 missões em 6 capítulos** fazem parte do mesmo jogo, na mesma tela de atendimento, montagem de pratos e avaliação. A Hanna não precisa abrir outro modo, nem aprender outra interface.

- **Café da Manhã** → pedidos mais simples: torrada, omelete, panquecas e frutas.
- **Pizzaria** → pizzas com recheios diferentes e pedidos mais detalhados.
- **Lanchonete** → hambúrgueres e sanduíches com combinações maiores.
- **Doceria** → sorvetes e sobremesas variadas.
- **Restaurante Cheio** → dois pedidos em sequência.
- **A Grande Festa** → desafios com dois ou três pedidos.

A complexidade aumenta gradualmente com receitas, ingredientes e quantidades de pedidos, **sem trocar o cenário original ou adicionar minijogos desconectados**. O botão **📋** permite consultar missões e repetir as concluídas. As seguintes são liberadas uma a uma; progresso e recorde de estrelas ficam salvos localmente (`hanna_missions_v1`).

O endereço antigo `/missions.html` apenas **redireciona para o restaurante**, para não quebrar links compartilhados.

## Como funciona

A criança escuta o pedido, seleciona o prato, arrasta os ingredientes e serve. Ingredientes extras ou ausentes influenciam a satisfação do cliente e suas frases em português. Cada rodada preserva sua voz quando possível, conforme a oferta de vozes do navegador.

## Estrutura

- `index.html`: jogo único, inclusive missões integradas.
- `assets/missions-data.js`: catálogo de 24 missões e regras de desbloqueio.
- `assets/food-art.js`: artes do restaurante.
- `assets/polish.css`: layout e lista de missões dentro da mesma interface.
- `assets/voice-engine.js`: diálogos e seleção de vozes.
- `missions.html`: redirecionamento de compatibilidade.
- `tests/smoke.html`: verificação de pedidos, progresso, estrelas e responsividade.
- `tests/missions-smoke.html`: verifica que o link legado não abre um segundo jogo.

A publicação é feita por GitHub Pages a cada atualização verificada pela GitHub Actions. Não há login, publicidade nem envio dos dados do jogo para terceiros.
