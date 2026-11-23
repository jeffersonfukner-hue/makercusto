# MakerCusto — contrato de trabalho

1. Ler README.md, docs/CONTINUIDADE.md, docs/ARQUITETURA.md e docs/PADROES.md antes de editar.
2. GitHub é a fonte oficial. Trabalhar em branch e PR. Não fazer merge, deploy, configurar domínio ou gastar créditos sem autorização explícita.
3. Preservar homologações; registrar fato, hipótese, pendência, testes e próximo passo em docs/CONTINUIDADE.md.
4. Cálculos são funções puras em src/domain; mudanças exigem testes determinísticos e regressão de cenários aprovados.
5. Não confundir margem sobre faturamento com markup sobre custo. Indicar estimativas; nunca chamar lucro bruto de lucro líquido.
6. Não presumir consumo da impressora, tarifa elétrica, valor de equipamento, perdas ou tempo de montagem: parâmetros editáveis, com hipóteses rotuladas.
7. Acessibilidade, telas pequenas (320px), responsividade e foco visível fazem parte dos critérios de aceite.
8. CI aprovado não substitui homologação visual. PR aberto não autoriza publicação.
9. Preview só após autorização/configuração separada de Cloudflare; GitHub Actions gera build/testes e não faz deploy.
10. Reutilizar lógica e componentes existentes; não duplicar cálculos em componentes.

## Regra obrigatória de comunicação e responsabilidades — homologada em 23/11/2026

Este contrato deve ser lido em **todo novo chat** antes de retomar o MakerCusto. Não redefinir responsabilidades, nem pedir que o proprietário acompanhe CI ou corrija testes.

- **Responsabilidade do agente (ChatGPT):** consultar GitHub e documentação; planejar e implementar o lote autorizado na branch; executar e acompanhar CI integralmente; examinar logs; corrigir falhas; repetir testes até concluir; registrar evidências, commits, CI e pendências em `docs/CONTINUIDADE.md` e `docs/REGISTRO_DE_ATIVIDADES.md`. Nunca transferir para o usuário tarefas técnicas que o agente consegue executar.
- **Responsabilidade do proprietário:** **exclusivamente as etapas que exigem sua intervenção**, como realizar o deploy **manual** no Cloudflare Pages e homologar visual/funcionalmente o Preview, **somente após sinalização explícita** do agente. Se for necessária outra intervenção, explicar exatamente o impedimento e os passos do usuário; não enviar ordens genéricas.
- **Estrutura obrigatória das respostas técnicas:** somente `Resultado`, `Pendências` e `Próxima ação`. Em `Próxima ação`, separar sempre `Minha ação (agente)` e `Sua ação (usuário)` ou indicar `Sua ação: nenhuma`. **Nunca** escrever “conferir o CI”, “verificar testes”, “corrigir falhas” como se fossem tarefas do usuário.
- **Comando de publicação sem ambiguidade:** se não estiver comprovadamente pronto, encerrar com **“NÃO FAÇA O DEPLOY AINDA.”** Se estiver pronto e houver autorização prévia para o usuário publicar manualmente, encerrar com **“PODE FAZER O DEPLOY MANUAL.”**, acompanhado de **SHA completo**, link para CI **aprovado no mesmo SHA**, instrução concisa e o que homologar. Não apresentar como pronto apenas por build isolado ou CI em andamento.
- **Sem ações implícitas:** o agente não faz deploy, merge, alterações operacionais nem operações com créditos/custos sem autorização explícita. O deploy pelo usuário **não** autoriza automaticamente migração SQL; quando necessária, explicar separadamente a etapa de banco e solicitar autorização.
- **Continuidade:** “ok”, “continue” ou “proceda” autorizam avançar no próximo trabalho já definido, sem novas perguntas desnecessárias; não autorizam merge/deploy, banco operacional ou gastos. Encerrar uma mensagem com trabalho técnico ainda pendente não transfere sua execução ao proprietário; comunicar apenas o estado comprovado.
