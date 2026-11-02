# OpenBit

Conversor de câmbio e painel de criptomoedas desenvolvido por Gustavo Sérgio com React, TypeScript, Vite e Tailwind CSS.

## Executar localmente

Use Node.js 24 LTS (mínimo 22.12).

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, com o caminho `/OpenBit/`.

## Validar

```sh
npm run check
npm audit
```

O comando `check` executa ESLint, TypeScript, testes de regressão e build de produção. Para visualizar o build, execute `npm run preview`.

## Dados e disponibilidade

- **Câmbio:** taxas diárias de referência da Frankfurter/BCE; ExchangeRate-API como alternativa, inclusive para moedas não cobertas pelo BCE. A data exibida é a publicação da fonte. Atualizar ignora o cache local.
- **Históricos de câmbio:** Frankfurter. Pares ou períodos sem cobertura exibem ausência de dados.
- **Criptomoedas:** catálogo completo da CoinGecko, com paginação de 48 ativos, busca global por nome/símbolo/ID e favoritas entre páginas. As opções de ordenação organizam a página atual. Pares Binance verificados recebem ticks ao vivo; as demais moedas usam as cotações CoinGecko.
- **Moeda das criptos:** seletor no início da barra com USD, BRL, EUR, GBP, JPY, CAD, AUD e CHF. Preços, capitalização, máximas, mínimas e gráficos são consultados na moeda escolhida. Ticks Binance são usados no painel apenas em USD, com identificação de USDT; nas demais moedas, o painel usa CoinGecko.
- **Ao vivo:** uma conexão WebSocket Binance compartilhada entre ticker e painel, com reconexão e limpeza ao desmontar. Preços Binance são em USDT; referências e históricos CoinGecko são em USD. A interface distingue as fontes.
- Falhas de rede não geram preços estimados nem históricos simulados. Há mensagens de erro e possibilidade de atualizar.
- Não são necessárias chaves de API. Nunca coloque segredos em variáveis `VITE_*`, pois elas podem aparecer no código público.
- Favoritos e preferência de tema ficam no navegador. O app continua funcionando se o armazenamento estiver indisponível.

## Estrutura

- `src/services`: consultas HTTP com timeout, validação e cache.
- `src/hooks`: conexão compartilhada e comportamento de diálogos.
- `src/components`: conversor, painel, ticker, navegação e apresentação.
- `src/test` e `src/services/market.test.ts`: regressões de dados, concorrência, teclado e conexão.

## Publicação

O workflow `.github/workflows/deploy.yml` valida pushes e pull requests. Somente a `main` e execuções manuais publicam no GitHub Pages após os checks. Ative **Settings → Pages → Source → GitHub Actions**.

O caminho de publicação é configurado em `vite.config.ts` como `/OpenBit/`.

Site: https://gustavosergio.github.io/OpenBit/

## Histórico e contribuição

Use commits por responsabilidade, com Conventional Commits (`fix`, `feat`, `test`, `ci`, `docs`, `chore`). Não inclua `dist`, `node_modules`, arquivos `.env` ou `*.tsbuildinfo`.

Os sete commits iniciais foram preservados. Eles representam a importação do projeto em etapas e os primeiros ainda não contêm toda a aplicação necessária para um build.

O override de `minimatch >=11.0.1` corrige [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Reavalie-o quando as dependências de lint adotarem a versão corrigida.

## Referências

- [Frankfurter v1](https://frankfurter.dev/v1/)
- [CoinGecko Markets](https://docs.coingecko.com/reference/coins-markets)
- [Deploy do Vite](https://vite.dev/guide/static-deploy)
- [TypeScript ESLint](https://typescript-eslint.io/getting-started/)

## Licença

MIT. Consulte [LICENSE](LICENSE).
