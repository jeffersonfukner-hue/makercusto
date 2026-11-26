# MakerCusto

Calculadora de custos e precificação para makers, começando por impressão 3D.

**Estado:** fundação técnica em desenvolvimento, não publicada.

## Desenvolvimento

Requer Node.js 22 e npm.

```bash
npm install
npm run dev
npm run check
npm run test
npm run build
```

Opcional: `npx playwright install chromium && npm run test:e2e`.

## Escopo da fundação

Simulador local de filamento, energia, depreciação, acessórios e montagem com rateio por lote, margem e markup. Não há servidor, contas, importação de fatiadores ou publicação.

Leia [AGENTS.md](AGENTS.md) e [docs/CONTINUIDADE.md](docs/CONTINUIDADE.md) antes de alterar o projeto.
