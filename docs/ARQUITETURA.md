# Arquitetura — decisão inicial

- React + TypeScript + Vite, SPA estática, sem backend nesta etapa.
- `src/domain/cost.ts`: motor puro e testável, separado da apresentação.
- `src/App.tsx`: primeiro simulador; estados em memória, sem gravação de dados ainda.
- `src/styles.css`: tokens e estilos responsivos.
- Vitest: regras de matemática, lote e limites. Playwright: fluxo desktop/mobile.
- GitHub Actions: tipagem, testes unitários, build e navegador; nenhum deploy.
- Persistência offline/IndexedDB, PWA, G-code, multimesas, perfis e exportação ficam no backlog.
- Cálculos usam números JS na versão piloto, com arredondamento apenas na apresentação. Antes de operações financeiras persistidas, adotar decimal/inteiros em centavos e definir política de rateio e arredondamento.
- Sem comunicação com endpoints, sem dados financeiros enviados a servidores.
