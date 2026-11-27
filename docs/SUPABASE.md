# Supabase (etapa 1: tabela de cálculos + login Google)

Regras: nada disso roda em produção sem autorização. Nunca cole a chave `service_role` nem a senha do banco em chat, código ou GitHub.

## 1. Projeto
- Criar um projeto NOVO e separado (plano gratuito), só para o MakerCusto novo. Não reaproveitar o do projeto antigo.
- Rodar `supabase/migrations/20261127120000_calculos.sql` no SQL Editor desse projeto de teste.
- Os testes de segurança ficam em `supabase/rls.test.ts` (rodam com `npm test`, num Postgres local).

## 2. Login com Google
1. Google Cloud Console: criar projeto, configurar a tela de consentimento (tipo Externo) e criar uma credencial "ID do cliente OAuth" do tipo Aplicativo da Web.
2. Em "URIs de redirecionamento autorizados", colocar a URL de callback que aparece em Supabase > Authentication > Providers > Google (formato `https://<ref-do-projeto>.supabase.co/auth/v1/callback`).
3. Copiar o Client ID e o Client Secret para o Supabase, no mesmo provedor Google, e ativar.
4. Em Supabase > Authentication > URL Configuration, em Redirect URLs, permitir o endereço do Preview (`https://*.makercusto-preview.pages.dev/**`) e `http://localhost:5173/**`.
5. Variáveis no Cloudflare Pages (só as públicas): `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
