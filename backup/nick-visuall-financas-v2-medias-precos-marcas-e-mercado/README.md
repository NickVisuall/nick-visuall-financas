# Nick Visuall Finanças

Dashboard de finanças domésticas inspirado na estrutura visual e na experiência do Nick Visuall CRM. A primeira área do projeto é dedicada ao planejamento e acompanhamento de compras de mercado.

## O que já funciona

- tabela principal com item editável, quantidade ideal, comprado no mês, excessos atual e anterior e quantidade comprada a menos no mês passado;
- aba de médias com período selecionável, média mensal gasta, quantidade média comprada, preço médio, comparação com a quantidade ideal e gráficos;
- lista de compras ligada automaticamente à tabela principal;
- checkbox que risca o item, quantidade restante automática, quantidade comprada e valor gasto editáveis;
- histórico mensal criado automaticamente e usado nos cálculos;
- persistência local no navegador, backup e restauração em JSON;
- exportação da tabela principal em CSV;
- filtros por nome, categoria e situação;
- destaque minimalista baseado exclusivamente no excesso ou na quantidade comprada a menos no mês passado;
- linhas e colunas reordenáveis por arrastar, com ordem salva no navegador;
- visualização mobile dedicada somente à lista de compras;
- tabela separada com sugestões pesquisadas para futuras evoluções.

O campo **Preço** da lista representa o valor unitário. O gasto mensal é calculado por `quantidade comprada × preço`, e alimenta automaticamente a aba de médias.

Marca e mercado são editados na lista e aparecem automaticamente no planejamento. Os valores iniciais são referências pesquisadas para o **Atacadão Taipas**; como preços e estoque variam por data, oferta e região, todos continuam editáveis.

## Backups de versões

Antes de cada nova publicação, a versão anterior completa deve ser copiada para `backup/`. As pastas seguem o padrão `nick-visuall-financas-vX-descrição-breve`, com o número incrementado e um resumo curto do conteúdo daquela versão, para facilitar a restauração. Exemplo: `nick-visuall-financas-v2-medias-precos-marcas-e-mercado`.

## Como abrir

O projeto usa somente HTML, CSS e JavaScript. Abra `index.html` no navegador ou publique os arquivos diretamente com GitHub Pages. Não há etapa de build nem dependências externas.

## Privacidade

Os dados ficam no `localStorage` do navegador do aparelho. Use o botão de backup para baixar uma cópia em JSON antes de limpar os dados do navegador ou trocar de dispositivo.

## Referências da tabela de sugestões

- [Financial Consumer Agency of Canada — Making a budget](https://www.canada.ca/en/financial-consumer-agency/services/make-budget.html)
- [Moneysmart — Track your spending](https://moneysmart.gov.au/budgeting/track-your-spending)
- [Consumer Financial Protection Bureau — Assess your spending](https://www.consumerfinance.gov/owning-a-home/prepare/assess-your-spending/)
- [Consumer Financial Protection Bureau — Consumer insights on managing spending](https://www.consumerfinance.gov/data-research/research-reports/consumer-insights-managing-spending/)
