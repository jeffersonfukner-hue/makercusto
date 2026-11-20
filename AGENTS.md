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
