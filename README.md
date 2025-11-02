# RAG Farm Tracker

Web app para rastrear sessões de farm em Ragnarok Online, calcular lucros e analisar drops.

## Características

- ⏱️ **Timer de Sessão** - Controle completo com iniciar, pausar, retomar e encerrar
- 🎯 **Seleção Múltipla de Mobs** - Escolha vários mobs para trackear na mesma sessão
- 📊 **Tracking de Drops** - Interface intuitiva para registrar quantidade de cada item dropado
- 💰 **Cálculo de Lucro** - Valor NPC + opção de definir preços customizados de mercado
- 📈 **Lucro por Hora** - Cálculo automático baseado no tempo ativo da sessão
- 💾 **Persistência Local** - Todos os dados salvos automaticamente no navegador
- 📥 **Export/Import** - Suporte para JSON e CSV para análises futuras

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- (Opcional) Conta no Supabase para usar Salas Compartilhadas

## Instalação

1. Clone ou baixe este repositório

2. Instale as dependências:
```bash
cd rag-farm-tracker
npm install
```

3. Processe os arquivos YAML para JSON (já foi feito, mas caso precise novamente):
```bash
npm run process-data
```

4. **(Opcional)** Para habilitar Salas Compartilhadas no Boss Time Tracker:
   - Siga as instruções em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Configure as variáveis de ambiente (veja seção abaixo)

## Como Usar

### Iniciar o app em desenvolvimento

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

### Preview do build de produção

```bash
npm run preview
```

## Deploy na Vercel

### Configuração de Variáveis de Ambiente

Para usar o Boss Time Tracker com Salas Compartilhadas em produção (Vercel), você precisa configurar as variáveis de ambiente:

1. **No seu projeto Vercel:**
   - Acesse o dashboard da Vercel
   - Vá para **Settings** > **Environment Variables**

2. **Adicione as seguintes variáveis:**
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

3. **Como obter os valores:**
   - Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
   - Vá em **Settings** > **API**
   - Copie o **Project URL** e a chave **anon public**

4. **Salve e faça redeploy:**
   - Clique em **Save**
   - Faça um novo deploy ou use **Deployments** > **Redeploy**

### Verificar se está funcionando

Após o deploy com as variáveis configuradas:

1. Acesse seu site em produção
2. Vá para `/boss-tracker`
3. O botão **"🚪 Criar/Entrar Sala"** deve aparecer no canto superior direito
4. Se não aparecer, verifique:
   - Console do navegador (F12) para erros
   - Se as variáveis de ambiente estão corretas na Vercel
   - Se você fez o redeploy após adicionar as variáveis

### Sem Supabase Configurado

Se você **não** configurar o Supabase:
- O Boss Time Tracker não funcionará (mostrará erro)
- Todas as outras funcionalidades do app (Farm Tracker, Optimizer, Planner, etc.) continuam funcionando normalmente
- **Nota:** O Boss Time Tracker agora **requer salas compartilhadas** - não há mais modo solo/local

## Fluxo de Uso

### 1. Selecionar Mobs
- Use a busca para encontrar os mobs que você vai caçar
- Clique para selecionar múltiplos mobs
- **Importante:** Só é possível selecionar mobs quando a sessão está idle (não iniciada)

### 2. Iniciar Sessão
- Clique em "Iniciar Sessão" no timer
- O timer começará a contar
- Você pode pausar e retomar a qualquer momento

### 3. Registrar Drops
- Durante ou após a sessão, expanda cada mob na seção "Tracking de Drops"
- Insira a quantidade de cada item dropado
- Opcionalmente, defina preços customizados (preço de mercado) para itens valiosos

### 4. Visualizar Lucro
- O resumo mostra:
  - **Lucro Total** - Soma de todos os itens com seus valores
  - **Lucro por Hora** - Baseado no tempo ativo (excluindo pausas)
  - **Total de Itens** - Quantidade total dropada
  - **Comparação** - Diferença entre valor NPC e preços customizados

### 5. Encerrar e Salvar
- Clique em "Encerrar" quando terminar a sessão
- A sessão será automaticamente salva no histórico
- Uma nova sessão será criada automaticamente

### 6. Export/Import

#### Exportar Sessão Atual
- **Export JSON** - Formato completo com todos os dados
- **Export CSV** - Planilha com resumo da sessão
- **Export Detalhes** - CSV detalhado com cada item dropado

#### Exportar Histórico
- **Export Tudo (JSON)** - Todas as sessões salvas no navegador
- **Export Tudo (CSV)** - Planilha com resumo de todas as sessões

#### Importar
- Use "Importar JSON" para carregar sessões exportadas anteriormente
- Útil para backup ou migração entre navegadores

## Estrutura de Dados

### Mobs (2.420 mobs)
Informações incluem: nome, level, HP, drops com taxas, elemento, raça, etc.

### Items (23.536 itens)
Informações incluem: nome, tipo, peso, valor de compra/venda NPC, slots, etc.

## Armazenamento Local

Os dados são salvos automaticamente no `localStorage` do navegador:
- **Sessão Atual** - Salva em tempo real
- **Histórico** - Sessões completadas ficam disponíveis para export

**Importante:** Limpar os dados do navegador irá apagar todo o histórico. Faça exports regulares!

## Tecnologias

- **React 19** - Framework frontend
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização
- **js-yaml** - Processamento dos dados
- **date-fns** - Manipulação de tempo

## Estrutura do Projeto

```
rag-farm-tracker/
├── src/
│   ├── components/       # Componentes React
│   │   ├── Timer.tsx
│   │   ├── MobSelector.tsx
│   │   ├── DropTracker.tsx
│   │   ├── ProfitSummary.tsx
│   │   └── ExportImport.tsx
│   ├── hooks/            # React hooks customizados
│   │   └── useSession.ts
│   ├── utils/            # Utilitários
│   │   ├── time.ts
│   │   └── export.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── data/             # Dados processados (JSON)
│   │   ├── mobs.json
│   │   ├── items.json
│   │   └── mobs-index.json
│   └── App.tsx
├── scripts/
│   └── processYaml.js    # Script para processar YAMLs
├── DB_ItemInfo.yml       # Database original de itens
└── DB_MobInfo.yml        # Database original de mobs
```

## Dicas

1. **Preços Customizados** - Use para itens que você vende no mercado por valores diferentes do NPC
2. **Pausar Sessões** - Pause quando fizer breaks para cálculos mais precisos
3. **Export Regular** - Faça backups exportando o histórico periodicamente
4. **Múltiplos Mobs** - Útil para maps com spawn misto (ex: Orc Village com múltiplos tipos de Orcs)

## Suporte

Para reportar bugs ou sugerir features, abra uma issue no repositório.

## Licença

MIT
