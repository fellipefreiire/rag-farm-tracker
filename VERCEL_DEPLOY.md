# Como Configurar Variáveis de Ambiente na Vercel

## Problema
Erro 404 ao tentar criar sala em produção porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução Rápida

### Passo 1: Acessar Configurações da Vercel
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto `rag-farm-tracker`
3. Clique em **Settings** (no topo da página)
4. No menu lateral, clique em **Environment Variables**

### Passo 2: Adicionar as Variáveis
Adicione estas duas variáveis clicando em "Add New":

**Variável 1:**
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://iqbynuyobeuymiqzfybf.supabase.co`
- **Environments:** Selecione: Production, Preview, Development

**Variável 2:**
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYnludXlvYmV1eW1pcXpmeWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDg0NTEsImV4cCI6MjA3NzY4NDQ1MX0.-rFvSFga0GfBSkR_9i1ThHboV1NNLPmRFWq0Fksp92c`
- **Environments:** Selecione: Production, Preview, Development

### Passo 3: Redeploy
Depois de salvar as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos três pontos (...) no deployment mais recente
3. Selecione **Redeploy**
4. Aguarde o build e deploy finalizarem

### Passo 4: Verificar
1. Acesse seu site em produção
2. Vá para `/boss-tracker`
3. Você deve ver o botão **"🚪 Criar/Entrar Sala"** no canto superior direito
4. Clique nele e tente criar uma sala
5. Deve funcionar sem erro 404!

## Troubleshooting

### Ainda recebendo erro 404?
- Certifique-se de que fez o **Redeploy** após adicionar as variáveis
- Verifique se não há espaços extras nos valores das variáveis
- Limpe o cache do navegador (Ctrl+Shift+R)

### Botão de sala não aparece?
- Abra o Console do navegador (F12)
- Procure por avisos sobre Supabase
- Verifique se as variáveis foram salvas corretamente na Vercel

### Database errors?
- Certifique-se de que executou o script SQL no Supabase
- Veja o arquivo `supabase-schema.sql` na raiz do projeto
- Execute no SQL Editor do Supabase Dashboard

## Segurança

⚠️ **IMPORTANTE:**
- As credenciais acima são do seu projeto Supabase
- A chave `anon` é segura para expor publicamente (ela é usada no frontend)
- Nunca compartilhe a chave `service_role` (essa sim é secreta)
- O Supabase usa Row Level Security (RLS) para proteger os dados

## Documentação Adicional

Para mais informações, consulte:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup completo do Supabase
- [README.md](./README.md) - Documentação geral do projeto
