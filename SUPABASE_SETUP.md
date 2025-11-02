# Supabase Setup Guide

Este guia explica como configurar o Supabase para habilitar o recurso de Salas Compartilhadas no Boss Time Tracker.

## Passo 1: Criar uma Conta Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita (se ainda não tiver)
3. Crie um novo projeto
   - Nome do projeto: `rag-farm-tracker` (ou qualquer nome de sua preferência)
   - Senha do banco: escolha uma senha forte (você NÃO vai precisar dela frequentemente)
   - Região: escolha a mais próxima (ex: South America - São Paulo)

## Passo 2: Configurar o Banco de Dados

1. No dashboard do Supabase, vá para **SQL Editor** (no menu lateral esquerdo)
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql` (na raiz do projeto)
4. Cole no editor SQL
5. Clique em **Run** para executar o script
6. Aguarde a confirmação de que todas as tabelas foram criadas com sucesso

## Passo 3: Obter as Credenciais

1. No dashboard do Supabase, vá para **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API** (no submenu de Settings)
3. Você verá duas informações importantes:
   - **Project URL**: algo como `https://xxxxxxx.supabase.co`
   - **anon public**: uma chave longa (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Passo 4: Configurar o Projeto

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores placeholder pelas suas credenciais:

```env
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Salve o arquivo

## Passo 5: Reiniciar o Servidor

```bash
npm run dev
```

O servidor de desenvolvimento precisa ser reiniciado para carregar as novas variáveis de ambiente.

## Passo 6: Testar

1. Acesse o Boss Time Tracker: `http://localhost:5173/boss-tracker`
2. Clique no botão **"Criar/Entrar Sala"**
3. Se tudo estiver configurado corretamente, você verá o modal de criar/entrar sala

## Verificação de Problemas

Se o botão "Criar/Entrar Sala" não aparecer:

1. Verifique se o arquivo `.env.local` existe e está na raiz do projeto
2. Verifique se as credenciais estão corretas (sem espaços extras)
3. Verifique o console do navegador (F12) para erros
4. Certifique-se de que reiniciou o servidor após editar o `.env.local`

## Realtime (Opcional mas Recomendado)

Para garantir que as atualizações em tempo real funcionem:

1. No dashboard do Supabase, vá para **Database** > **Replication**
2. Certifique-se de que as tabelas `rooms`, `room_members` e `boss_timers` estão com Realtime habilitado
3. Se não estiverem, clique em cada uma e habilite o Realtime

## Limpeza Automática de Salas Inativas (Opcional)

Para limpar salas inativas automaticamente:

1. No Supabase, vá para **Database** > **Functions**
2. Crie uma nova função PostgreSQL se ainda não existir (já foi criada pelo schema SQL)
3. Configure um Supabase Edge Function ou cron job para chamar `cleanup_inactive_rooms()` periodicamente

Ou simplesmente ignore - as salas ficaram no banco até você deletá-las manualmente.

## Custos

O plano gratuito do Supabase inclui:
- 500 MB de armazenamento de banco de dados
- 1 GB de transferência por mês
- Realtime connections ilimitadas

Isso deve ser mais do que suficiente para uso pessoal e pequenos grupos de jogadores.

## Segurança

- As senhas são armazenadas com hash SHA-256
- As salas são isoladas (apenas quem tem o link e senha pode entrar)
- O Supabase tem Row Level Security (RLS) configurado
- Para produção, considere usar autenticação mais robusta

## Suporte

Se tiver problemas, verifique:
1. Console do navegador (F12 > Console)
2. Network tab (para ver se as requisições ao Supabase estão sendo feitas)
3. Supabase Dashboard > Logs (para ver erros no servidor)
