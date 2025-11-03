# Fix para Sincronização em Tempo Real (DELETE/UPDATE)

## 🔴 Problema Identificado

Quando um boss é removido da lista de timers, a remoção só aparecia para o usuário que executou a ação. Outros usuários na mesma sala só viam a atualização após recarregar a página.

**Causa Raiz:**
- O Supabase Realtime precisa de `REPLICA IDENTITY FULL` nas tabelas para enviar eventos DELETE/UPDATE com os dados completos
- Sem essa configuração, os eventos DELETE não incluem `payload.old.id`, impedindo a sincronização
- O código tinha fallbacks locais que mascaravam o problema, atualizando apenas o estado local

## ✅ Solução

### Passo 1: Executar SQL no Supabase (OBRIGATÓRIO)

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute o arquivo `supabase-fix-realtime-delete.sql`:

```sql
-- Fix Supabase Realtime DELETE events
ALTER TABLE boss_timers REPLICA IDENTITY FULL;
ALTER TABLE room_members REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;
```

4. Verifique que foi aplicado corretamente executando:

```sql
SELECT
  schemaname,
  tablename,
  CASE relreplident
    WHEN 'd' THEN 'default'
    WHEN 'n' THEN 'nothing'
    WHEN 'f' THEN 'full'
    WHEN 'i' THEN 'index'
  END as replica_identity
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE schemaname = 'public'
  AND tablename IN ('boss_timers', 'room_members', 'rooms');
```

**Resultado esperado:**
```
 schemaname |  tablename   | replica_identity
------------+--------------+------------------
 public     | boss_timers  | full
 public     | room_members | full
 public     | rooms        | full
```

### Passo 2: Alterações no Código (JÁ APLICADAS)

As seguintes alterações foram feitas em `src/hooks/useRealtimeTimers.ts`:

1. **Removida atualização local imediata em `addTimer()`**
   - Antes: Atualizava o estado local após INSERT/UPDATE
   - Agora: Confia 100% no evento realtime

2. **Removida atualização local imediata em `removeTimer()`**
   - Antes: Filtrava o timer removido localmente
   - Agora: Confia 100% no evento realtime DELETE

## 🧪 Como Testar

1. Abra a aplicação em 2 navegadores diferentes (ou abas anônimas)
2. Entre na mesma sala com ambos
3. Em um navegador, adicione um boss ao tracker
   - ✅ Deve aparecer em AMBOS navegadores instantaneamente
4. Em um navegador, remova o boss
   - ✅ Deve desaparecer de AMBOS navegadores instantaneamente
5. Em um navegador, resete o timer (update)
   - ✅ Deve atualizar em AMBOS navegadores instantaneamente

## 📊 Logs de Debug

Com as alterações, você verá logs mais claros no console:

**Ao adicionar:**
```
addTimer: Inserting new timer
addTimer: INSERT sent, waiting for realtime event
INSERT event received: {boss_name: "...", ...}
```

**Ao remover:**
```
removeTimer: Attempting to delete timer: abc-123
removeTimer: DELETE sent, waiting for realtime event
DELETE event received: {old: {id: "abc-123", ...}}
Filtered timers: [...]
```

**Ao resetar:**
```
addTimer: Updating existing timer: abc-123
addTimer: UPDATE sent, waiting for realtime event
UPDATE event received: {id: "abc-123", ...}
```

## ⚠️ Importante

- **REPLICA IDENTITY FULL** aumenta ligeiramente o uso de recursos no Supabase, pois envia dados completos em cada evento
- Para a maioria dos casos de uso (como este), o impacto é insignificante
- É a configuração recomendada quando você precisa de sincronização realtime completa

## 🔍 Arquivos Modificados

1. **supabase-fix-realtime-delete.sql** (novo) - SQL para corrigir configuração do banco
2. **src/hooks/useRealtimeTimers.ts** - Removidos fallbacks locais
3. **REALTIME-FIX.md** (este arquivo) - Documentação da correção

## 📚 Referências

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)
