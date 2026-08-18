# Nick Visuall Finanças

Dashboard de finanças domésticas inspirado na estrutura visual e na experiência do Nick Visuall CRM. A primeira área do projeto é dedicada ao planejamento e acompanhamento de compras de mercado.

## O que já funciona

- tabela principal com item editável, média mensal de gasto, quantidade ideal, comprado no mês e excessos atual e anterior;
- lista de compras ligada automaticamente à tabela principal;
- checkbox que risca o item, quantidade restante automática, quantidade comprada e valor gasto editáveis;
- histórico mensal criado automaticamente e usado nos cálculos;
- persistência local no navegador, backup e restauração em JSON;
- exportação da tabela principal em CSV;
- filtros por nome, categoria e situação;
- visualização mobile dedicada somente à lista de compras;
- tabela separada com sugestões pesquisadas para futuras evoluções.

O campo **Valor gasto** da lista é o que permite calcular automaticamente a média mensal em reais de cada item.

## Como abrir

O projeto usa somente HTML, CSS e JavaScript. Abra `index.html` no navegador ou publique os arquivos diretamente com GitHub Pages. Não há etapa de build nem dependências externas.

## Privacidade

Os dados ficam no `localStorage` do navegador do aparelho. Use o botão de backup para baixar uma cópia em JSON antes de limpar os dados do navegador ou trocar de dispositivo.

## Referências da tabela de sugestões

- [Financial Consumer Agency of Canada — Making a budget](https://www.canada.ca/en/financial-consumer-agency/services/make-budget.html)
- [Moneysmart — Track your spending](https://moneysmart.gov.au/budgeting/track-your-spending)
- [Consumer Financial Protection Bureau — Assess your spending](https://www.consumerfinance.gov/owning-a-home/prepare/assess-your-spending/)
- [Consumer Financial Protection Bureau — Consumer insights on managing spending](https://www.consumerfinance.gov/data-research/research-reports/consumer-insights-managing-spending/)
