# Padrões do MakerCusto: um organismo, não uma colcha de retalhos

Regra do projeto: **cada coisa existe em um lugar só.** Mudou ali, muda em tudo que usa. Antes de criar algo novo, procurar aqui se já existe.

## O que já é compartilhado
| Padrão | Onde mora | Quem usa |
|---|---|---|
| Campo com etiqueta, "i", "+", unidade e laranja de pendente | `Campos.tsx` (`Fld`, `Label`, `Info`) | todas as telas |
| Cadastro rápido em janela | `Campos.tsx` (`QuickForm`) e `Rapido.tsx` | Calculadora, Produto |
| Textos de ajuda | `ajuda.ts` | todas as telas |
| Cálculo de custo e de produto | `domain/` (funções puras, com teste) | Calculadora, Produto, Painel |
| Histórico por nome | `domain/versions.ts` | Produto, Painel |
| O que falta + busca de campo | `Pendencias.tsx` | Produto |
| Cores, sombras, bordas | `styles.css` (variáveis `--main`, `--amber`, `--ink`) | tudo |

## Repetições encontradas (a unificar na próxima rodada)
1. **Janela (modal):** `modalback` escrito em 3 lugares. Criar `Modal` único (foco, Esc, clique fora).
2. **Excluir com confirmação:** `confirm(...)` copiado em 11 lugares. Criar um `confirmar()` único, com o mesmo texto e visual do app.
3. **Lista de itens com Abrir/Excluir (`ul.jobs`):** 6 telas com markup próprio. Criar `ListaItens`.
4. **Tabela que vira cartão no celular:** 5 cópias (`scroll stack`). Criar `Tabela` (o `Table` do Painel já faz isso).
5. **Escolher filamento/impressora cadastrados:** o mesmo select + "+" em Calculadora, Produto e na janela de preço único. Criar `EscolherFilamento` e `EscolherImpressora`.
6. **Abas:** só no Produto. Criar `Abas` para a Calculadora e os cadastros usarem.
7. **Barra inferior de resumo:** só no Produto. Generalizar `BarraResumo`.
8. **Formatar dinheiro e data:** vários `toLocaleString`. Centralizar em `format.ts`.
9. **Aviso de salvo/erro:** mensagens soltas por tela. Criar `Aviso`.
10. **Busca de campo e "o que falta":** ligar na Calculadora e nos cadastros pelo mesmo `Pendencias`.

## Como mudar um padrão
Alterar o componente ou a variável de CSS. As telas não repetem estilo próprio. Se uma tela precisa de uma exceção, a exceção vira uma opção do componente, não uma cópia.
