# MakerCusto — Padrão de UI/UX: simplicidade progressiva e módulos conectados

**Definição de produto:** 23/11/2026. **Direção de UX definida pelo usuário para implementação gradual**, preservando as homologações técnicas e de segurança existentes. **Não** significa que todos os módulos estejam implementados ou homologados visualmente.

## Objetivo

O MakerCusto deve eliminar trabalho repetitivo, conectar dados reais entre módulos e mostrar somente a complexidade necessária em cada etapa. Um iniciante conclui seu primeiro custo sem entender gestão de estoque; um usuário técnico consegue configurar tudo sem perder flexibilidade.

**Metáfora funcional:** um organismo vivo — cadastros alimentam automaticamente cálculos, conjuntos, impressão, estoque e relatórios, com relações por ID, histórico auditável e sem criar registros duplicados.

## Padrão reutilizável por campo e módulo

| Nível | Exposição inicial | Ações e comportamento |
| --- | --- | --- |
| **Simples (padrão)** | Escolher item cadastrado (busca e até três sugestões relevantes); ações **Cadastrar** e **Detalhes** no contexto | Campos mínimos para continuar; aplicar dados conhecidos; salvar sem exigir dados técnicos opcionais |
| **Detalhes (sob demanda)** | Informações frequentes, saldo e custo conhecidos, origem, notas e configurações ligadas ao item | Expandir sem perder o preenchimento; editar com prévia de impactos; mensagens curtas junto ao campo |
| **Avançado (opcional)** | Todas as opções técnicas e de precisão relevantes para aquele item | Perfis, parâmetros finos, exceções, fontes e métodos de custo; validar limites e dependências; nunca remover capacidade da camada avançada para simplificar a básica |

Regras gerais: **nem excesso de campos no início nem falta de recursos no avançado**; distinção visual entre dado confirmado, estimado e desconhecido; não inventar custos; lembrar modo preferido quando adequado; nunca esconder alertas obrigatórios, evidências ou erros; não perguntar novamente informação já cadastrada; explicações contextuais breves; permitir retornar ao simples sem perda de dados.

## Exemplo principal — Filamento

1. Escolha material/bobina existente com busca por nome, fabricante, tipo e cor.
2. Se não existir, **Cadastrar** sem sair do trabalho atual; voltar com o item já selecionado. Registro inicial solicita somente os dados realmente necessários conforme operação (material e identificação, saldo físico se estiver inventariando; uma configuração de slicer não obriga criar entrada física).
3. **Detalhes** mostra bobina, estoque, proveniência, custo conhecido/estimado/desconhecido, dicas e perfis existentes.
4. **Avançado** permite editar ou clonar perfis de extrusão, temperatura, velocidade, ventilação, retração, secagem e demais opções disponíveis; manter padrão protegido, registrar personalização e não confundir perfil de impressão com preço/compra.
5. Campos específicos podem ter `Mais opções` local quando fizer sentido; não obrigar abrir uma página técnica inteira.

## Fluxo-alvo integrado

**Calculadora → salvar como peça/produto → biblioteca do usuário → conjunto → impressão/produção → consumo real → custo e relatórios**, com navegação de retorno e sem redigitação.

- **Peça** é unidade comercial/física, independentemente da disposição em uma placa: guirlanda, estrela grande e estrela pequena são **três peças distintas**. Uma placa pode produzir as três, mas não transforma automaticamente três em uma peça.
- **Conjunto** vincula por ID os três cadastros; permite quantidade individual e preserva revisões/snapshots. Não duplicar peça já existente apenas porque foi selecionada.
- **Calculadora** deve carregar peças, produtos e conjuntos cadastrados e recuperar parâmetros salvos; ao concluir cálculo, oferecer **Salvar peça**, **Salvar produto** ou **Usar no conjunto**. Não inventar divisão de eletricidade/tempo em placa mista: rateio respeita política homologada específica.
- **Produção** recebe parâmetros conhecidos do cadastro; usuário informa somente o que ocorreu de fato. Consumo confirmado, reservas e auditoria mantêm proteções.
- **Módulo avançado** e **ocorrências excepcionais** surgem quando necessárias e não dominam a jornada cotidiana.

## Ordem sugerida de implementação e verificação

1. **P0 — Continuidade:** botão salvar cálculo visível no modo logado, recuperação de cálculo salvo, seleção de peças e produtos existentes no conjunto, ficha ligada com IDs reais. Testes do caso guirlanda + duas estrelas e regressão de custos.
2. **P1 — Campo Filamento:** transformar seleção/cadastro/detalhes/avançado em componente reutilizável e aplicar à calculadora, inventário e produção. Verificar preenchimento e retorno automático.
3. **P2 — Outros campos:** aplicar o mesmo padrão a impressoras, materiais, peças, preços, conjuntos e produção; identificar quais campos exigem opção local avançada.
4. **P3 — Jornada completa:** validar do cálculo inicial ao produto/conjunto impresso e ao custo final, em desktop e celular, com um maker iniciante; medir esforço real, pontos de redigitação e erros. Somente usuário homologa visualmente.
5. **P4 — Critérios SaaS:** suporte a oficinas com necessidades diferentes, perfis e permissões sem confundir plano pago com autorização.

**Critérios de aceite:** não redigitar itens conhecidos; inserir peça existente sem clonagem; custo histórico imutável; opções avançadas realmente completas; fluxo básico curto e evidente; nenhuma movimentação de estoque fictícia; transições claras entre módulos; instruções curtas e pertinentes; desktop e mobile.

## Não confundir estado atual com objetivo

Este documento é um padrão para orientar lotes futuros, **não** evidência de que o fluxo completo já esteja operacional. Ainda se exige CI, teste com banco apropriado, migrações autorizadas, homologação visual e avaliação de UX de cada módulo. Não fazer merge, deploy ou alteração do Supabase operacional sem autorização específica.
