# Arquitetura do MakerCusto

- React + TypeScript + Vite, site estático.
- `src/domain/cost.ts`: cálculo puro e independente da interface.
- `src/App.tsx`: formulário interativo; estados apenas em memória, sem armazenamento persistente.
- `src/styles.css`: tokens e estilo responsivo (desktop/mobile).
- Materiais multicor: `materials` com nome, peso do modelo, purga adicional e preço/kg; `grams/pricePerKg` são campos legados de compatibilidade e só entram quando `materials` está ausente.
- `materialBreakdown` expõe valores por cor para auditoria do custo. Não ler diretamente número de peças da cor como número de produtos finais.
- Vitest: motor matemático e validação; Playwright: interface e responsividade.
- GitHub Actions: tipagem, unitários, build, E2E; sem deploy.
- IndexedDB, PWA, G-code/3MF, multi-mesas e composição de kits ficam no backlog.
- Sem backend, autenticação ou transmissão de parâmetros de custos.
- Valores monetários ainda são cálculos em Number; em versão de produção persistente, adotar precisão decimal e regra explícita de arredondamento.
