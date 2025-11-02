# Sistema de Salas Compartilhadas - Boss Time Tracker

## ✅ Implementação Completa

O sistema de salas compartilhadas foi totalmente implementado! Agora você pode compartilhar timers de bosses em tempo real com outros jogadores.

## 📋 Recursos Implementados

### 1. Funcionalidades Principais
- ✅ Criar salas privadas com nome e senha
- ✅ Entrar em salas existentes via link ou ID
- ✅ Sincronização em tempo real de todos os timers
- ✅ Visualização de membros online
- ✅ Identificação visual por cores
- ✅ Timers com informação de quem adicionou
- ✅ Alertas sonoros sincronizados
- ✅ Salas temporárias (expiram quando todos saem)

### 2. Componentes Criados
- `RoomManager.tsx` - Modal para criar/entrar em salas
- `RoomHeader.tsx` - Cabeçalho com info da sala e membros
- `SharedBossTimeTracker.tsx` - Versão compartilhada do tracker
- Hook `useRoom` - Gerenciamento de salas
- Hook `useRealtimeTimers` - Sincronização de timers

### 3. Utilitários
- Sistema de cores para identificação de usuários
- Validações de entrada (nome, senha, display name)
- Geração de links compartilháveis
- Hash de senhas (SHA-256)
- Cópia para clipboard

## 🚀 Como Usar

### Passo 1: Configurar Supabase

**IMPORTANTE:** Antes de usar salas compartilhadas, você precisa configurar o Supabase.

Siga o guia completo em: **`SUPABASE_SETUP.md`**

Resumo rápido:
1. Criar conta gratuita no Supabase
2. Criar novo projeto
3. Executar o SQL em `supabase-schema.sql`
4. Copiar credenciais para `.env.local`
5. Reiniciar o servidor

### Passo 2: Usar o Sistema

#### Modo Local (sem Supabase)
- Acesse: `http://localhost:5173/boss-tracker`
- Timers salvos apenas localmente
- Não compartilhável

#### Modo Compartilhado (com Supabase configurado)
1. Acesse: `http://localhost:5173/boss-tracker`
2. Clique no botão **"🚪 Criar/Entrar Sala"** (aparece só se Supabase configurado)
3. Escolha:
   - **Criar Sala**: Defina nome, senha e seu display name
   - **Entrar em Sala**: Cole o link/ID da sala, senha e seu display name

## 📝 Fluxo de Uso

### Criando uma Sala

```
1. Clique em "Criar/Entrar Sala"
2. Aba "Criar Sala"
3. Preencha:
   - Nome da Sala: "Farm MVP - Thor"
   - Senha: "thor2024"
   - Seu Nome: "João"
4. Clique "Criar Sala"
5. Copie o link gerado
6. Compartilhe com seus amigos
```

### Entrando em uma Sala

```
1. Receba o link de um amigo
2. Clique em "Criar/Entrar Sala"
3. Aba "Entrar em Sala"
4. Cole o link recebido (ou apenas o ID)
5. Digite a senha
6. Digite seu nome de exibição
7. Clique "Entrar na Sala"
```

### Usando a Sala

```
- Veja membros online no cabeçalho
- Cada membro tem uma cor única
- Adicione timers normalmente
- Todos veem os mesmos timers em tempo real
- Timers mostram quem adicionou (nome + cor)
- Alertas tocam para todos quando atingem 90/120min
- Copie o link a qualquer momento
- Saia da sala quando quiser
```

## 🎨 Identificação Visual

Cada usuário recebe uma cor aleatória ao entrar na sala:
- Cor aparece na lista de membros
- Borda esquerda dos timers tem a cor de quem adicionou
- Nome colorido no detalhe do timer

Cores disponíveis:
- 🔴 Vermelho
- 🟠 Laranja
- 🟡 Amarelo
- 🟢 Verde
- 🔵 Azul
- 🟣 Roxo
- 🩷 Rosa
- 🩵 Ciano
- 🍏 Lima
- 🩶 Cinza

## 🔒 Segurança

- Senhas são hasheadas com SHA-256
- Salas protegidas por senha
- RLS (Row Level Security) habilitado no Supabase
- Salas não são listáveis publicamente
- Apenas quem tem link + senha pode entrar

## ⚙️ Tecnologias

- **Frontend**: React 19 + TypeScript
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Sincronização**: Supabase Realtime (WebSockets)
- **Styling**: Tailwind CSS
- **Persistência**: PostgreSQL (Supabase)

## 📊 Estrutura do Banco

### Tabelas
- `rooms` - Informações das salas
- `room_members` - Membros conectados
- `boss_timers` - Timers compartilhados

### Relações
- `room_members` → `rooms` (CASCADE DELETE)
- `boss_timers` → `rooms` (CASCADE DELETE)
- `boss_timers` → `room_members` (CASCADE DELETE)

## 🔧 Troubleshooting

### Botão "Criar/Entrar Sala" não aparece
- **Causa**: Supabase não configurado
- **Solução**: Configure `.env.local` e reinicie servidor

### Erro ao criar/entrar sala
- **Causa**: Credenciais inválidas ou tabelas não criadas
- **Solução**: Verifique credenciais e execute `supabase-schema.sql`

### Timers não sincronizam
- **Causa**: Realtime não habilitado
- **Solução**: No Supabase Dashboard → Database → Replication → Habilite nas 3 tabelas

### Sala desapareceu
- **Causa**: Todos saíram (sessão temporária)
- **Solução**: Crie uma nova sala

## 💡 Dicas

1. **Coordenação**: Use nomes descritivos para salas ("Farm Odin - Noite")
2. **Comunicação**: Combine senha simples com grupo (Discord, WhatsApp)
3. **Timers**: Adicione nome do player para saber quem matou
4. **Timezone**: Sistema converte automaticamente para cada usuário
5. **Performance**: Até 50 membros simultâneos funciona bem

## 🎯 Próximas Melhorias (Opcional)

- [ ] Chat em tempo real na sala
- [ ] Histórico de kills persistente
- [ ] Roles (admin, moderador, membro)
- [ ] Estatísticas da sala
- [ ] Notificações de desktop
- [ ] Sons customizáveis
- [ ] Temas de cores

## 📞 Suporte

Se encontrar problemas:
1. Verifique console do navegador (F12)
2. Verifique Supabase Dashboard → Logs
3. Confirme que as credenciais estão corretas
4. Teste criar sala sozinho primeiro

## 📄 Licença

Sistema de salas implementado como feature adicional do RAG Farm Tracker.
