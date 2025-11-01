# Início Rápido - RAG Farm Tracker

## Setup em 3 passos

1. **Instalar dependências**
```bash
cd rag-farm-tracker
npm install
```

2. **Iniciar o app**
```bash
npm run dev
```

3. **Abrir no navegador**
```
http://localhost:5173
```

## Primeiro Uso

### Exemplo: Farmar Scorpion

1. **Busque "Scorpion"** na seção de seleção de mobs
2. **Clique no Scorpion** para selecioná-lo
3. **Inicie a sessão** clicando em "Iniciar Sessão"
4. **Vá farmar!** O timer rodará automaticamente
5. Quando voltar, **expanda Scorpion** na seção "Tracking de Drops"
6. **Registre os drops**:
   - 10x Scorpion Tail
   - 5x Fine Grit
   - etc.
7. **Veja seu lucro** calculado automaticamente
8. **Encerre a sessão** quando terminar

## Recursos Principais

### Timer
- ⏯️ Pause quando fizer break (não conta no lucro/hora)
- ⏹️ Encerre para salvar no histórico

### Preços Custom
- Clique no campo "Valor Custom" para definir preço de mercado
- Deixe vazio para usar valor NPC

### Export
- **JSON**: Backup completo dos dados
- **CSV**: Abra no Excel para análises
- **Detalhes**: CSV com cada item dropado

## Dicas

- Selecione múltiplos mobs se estiver farmando em maps mistos
- Pause o timer quando fizer breaks para cálculos precisos
- Export seu histórico regularmente como backup
- Defina preços custom para itens valiosos que você vende no mercado

## Problemas?

Se o app não carregar:
1. Certifique-se que o Node.js está instalado (`node --version`)
2. Delete `node_modules` e rode `npm install` novamente
3. Verifique se a porta 5173 não está em uso

Se os dados não aparecerem:
1. Rode `npm run process-data` para reprocessar os YAMLs
2. Verifique se os arquivos `DB_ItemInfo.yml` e `DB_MobInfo.yml` estão na pasta raiz do projeto
