# 🍕 Cozinha da Hanna — Restaurante Divertido

Jogo de cozinha 2D, gratuito, no navegador. Atenda **quatro clientes**, prepare um **prato principal** e depois uma **sobremesa** para cada um; arraste os ingredientes e descubra a reação de cada cliente.

**Jogar:** https://lrm-lgtm.github.io/cozinha-da-hanna/

## Como funciona

- Anote o pedido, escolhendo o prato indicado pelo cliente.
- Arraste ingredientes até o prato. É permitido colocar ingredientes diferentes ou servir incompleto.
- A satisfação de 0 a 100% e de 0 a 3 estrelas considera acertos, faltas e ingredientes extras.
- O comentário do cliente varia de acordo com a satisfação e o tempo decorrido, **sem cronômetro de pressão**.
- Cada rodada apresenta **dois clientes com perfis de voz femininos e dois masculinos**, e cada personagem preserva sua personalidade vocal ao pedir e avaliar.
- Vozes preferem português brasileiro e, quando disponíveis, opções de maior qualidade do próprio aparelho. A qualidade efetiva varia por navegador/sistema. Não há serviço externo de voz ou áudio neural embutido nesta versão.

## Estrutura técnica

- `index.html` — jogo e regras.
- `assets/food-art.js` — desenhos vetoriais.
- `assets/polish.css` — estilos responsivos sem rolagem geral.
- `assets/voice-engine.js` — banco de falas, escolha de vozes e fallback Web Speech.
- `tests/voice-test.js` — testes de variações, vozes e fallback sem vozes disponíveis.
- `tests/smoke.html` — teste funcional de pedidos, arrasto, avaliação e responsividade.
- `.github/workflows/pages.yml` — validações automáticas e publicação pelo GitHub Pages.

Não exige login, não tem anúncios e não envia dados de jogo para servidores. O melhor resultado fica apenas no armazenamento local do navegador.
