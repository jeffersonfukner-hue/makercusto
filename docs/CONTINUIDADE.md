# MakerCusto — continuidade

## Situação — 20/11/2026
- Repositório: `jeffersonfukner-hue/makercusto`, privado, `main` reservada.
- Trabalho atual: `feat/fundacao-makercusto`, PR #1 (draft), **sem merge**.
- CI da fundação inicial: execução #44795814820, sucesso (tipos, 5 testes unitários, build, 4 E2E).
- Preview anterior: Cloudflare confirmou deploy do commit `d444af6` no endereço imutável `https://e8b60eff.makercusto-preview.pages.dev`. Isso NÃO valida aparência nem significa que commits posteriores foram publicados.
- Proprietário declarou que desativou deploys automáticos em Pages; configuração ainda não conferida diretamente por conector Cloudflare.
- **Novo acordo de publicação:** proprietário realiza deploys manualmente, somente após confirmação explícita de CI e indicação de commit pelo agente. Agente não chama deploy nem altera a configuração Cloudflare.
- Método: inspirado no OldArcade (AGENTS, documentação, PR/CI e homologação por fase).
- Cenário piloto com 20 chaveiros, 151,58 g de modelo, três cores (azul 83,26 g, branco 47,76 g, dourado 20,56 g), 11h14, material R$100/kg, hipótese 150W/R$1,03/kWh, máquina R$3500/3000h, argola R$0,35, montagem 2min/R$20h.
- Extensão em andamento: entradas de material por cor com preço específico e purga/perdas adicionais opcionais por cor, com somatório auditável. Não pressupor que o relatório do slicer exclui desperdício.
- Quantidade de peças douradas por chaveiro, composição/kit e importação do slicer permanecem não validadas.
- Sem conta, armazenamento persistente, backend ou coleta de informações dos cálculos.
- Testes desta extensão: consultar CI da revisão final do PR. Homologação visual desktop e mobile segue pendente.
- Próxima ação: checar último CI; se aprovado, informar SHA e solicitar ao proprietário o deploy manual do novo commit para homologação.

## Decisões do proprietário — 20/11/2026 (nova fila)
- Novo pedido: planejar conexão futura ao Supabase para salvar o custo de cada impressão; não implementar banco nesta entrega.
- Materiais: dois modos. Simples com tipo, peso em kg/g e preço; completo/Pro futuro com fabricante, data/valor da compra, lote opcional e etiqueta para bobina.
- Compras sucessivas do mesmo PLA azul (R$68 e R$73) precisam coexistir no histórico, sem sobrescrever o custo registrado de impressões anteriores. A política de precificação por lote será definida antes de implementar.
- Cadastro genérico de insumos do processo além de filamento.
- Foco imediato aprovado: simplicidade e edição multicor em acordeão: uma linha-resumo por material e apenas um formulário aberto por vez; trocar de cor preserva entradas.
- Respostas técnicas ao proprietário: somente Resultado, Pendências e Próxima ação; objetivas em pt-BR. Deploy manual exclusivo do proprietário; não fazer merge.
- CI e homologação da alteração no acordeão precisam ser consultados para o HEAD atual antes de indicar deploy.

## Ajuste UX solicitado — inclusão de cor no topo (20/11/2026)
- Ao clicar Adicionar cor, a nova entrada deve aparecer imediatamente no **topo** da lista e seu formulário deve abrir; demais materiais permanecem resumidos.
- Evitar a sensação de que o botão falhou e múltiplas adições por falta de visibilidade. Preservar as entradas anteriores e testar dois cliques consecutivos.
- Entrega depende do CI do HEAD e homologação visual; deploy continua exclusivamente manual pelo proprietário.
