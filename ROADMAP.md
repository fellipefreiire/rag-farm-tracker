# Roadmap - Próximas Features

## Versão Atual (MVP - v1.0)
✅ Timer de sessão com pause/resume
✅ Seleção múltipla de mobs
✅ Tracking de drops por item
✅ Cálculo de lucro (NPC + Custom)
✅ Persistência local (localStorage)
✅ Export/Import (JSON + CSV)

## Próximas Features Sugeridas

### v1.1 - Visualização de Histórico
- [ ] Página de histórico de sessões
- [ ] Filtros por data, mob, lucro
- [ ] Gráficos de lucro ao longo do tempo
- [ ] Comparação entre sessões
- [ ] Estatísticas gerais (melhor mob, média de lucro, etc.)

### v1.2 - Features de Análise
- [ ] Taxa de drop real vs taxa oficial
- [ ] Sugestão de mobs mais lucrativos
- [ ] Cálculo de eficiência (lucro/tempo)
- [ ] Metas de farm (ex: farmar até ter 1M de zeny)
- [ ] Notificações quando atingir metas

### v1.3 - UX Melhorias
- [ ] Dark mode
- [ ] Atalhos de teclado
- [ ] Som/notificação quando timer atinge tempo específico
- [ ] Templates de sessão (salvar configurações de mobs frequentes)
- [ ] Notas/comentários por sessão

### v1.4 - Dados Avançados
- [ ] Tracking de experiência (base/job)
- [ ] Cálculo de exp/hora
- [ ] Integração com preços de mercado (API externa?)
- [ ] Histórico de preços de itens
- [ ] Banco de dados de cards dropados

### v1.5 - Mobile & PWA
- [ ] Layout responsivo otimizado para mobile
- [ ] Progressive Web App (funciona offline)
- [ ] Instalação como app nativo
- [ ] Sincronização entre dispositivos

### v1.6 - Social & Compartilhamento
- [ ] Compartilhar sessões com outros players
- [ ] Ranking de lucro entre amigos
- [ ] Export para Discord/redes sociais
- [ ] Integração com guilds

### v2.0 - Multi-servidor
- [ ] Suporte para diferentes servidores de RO
- [ ] Taxas de drop customizadas por servidor
- [ ] Preços de mercado por servidor
- [ ] Configurações de rates (1x, 5x, etc.)

## Melhorias Técnicas

### Performance
- [ ] Lazy loading dos dados de mobs/itens
- [ ] Virtualização da lista de mobs
- [ ] Code splitting por rota
- [ ] Cache de busca de mobs

### Qualidade
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Documentação de componentes (Storybook)

### DevEx
- [ ] Configuração de linter mais estrita
- [ ] Prettier para formatação
- [ ] Husky para pre-commit hooks
- [ ] Conventional commits

## Contribuições

Quer implementar alguma dessas features? Siga o processo:

1. Crie uma issue descrevendo a feature
2. Aguarde aprovação/discussão
3. Faça fork do projeto
4. Crie uma branch (`feature/nome-da-feature`)
5. Implemente com testes
6. Abra um Pull Request

## Feedback

Tem sugestões de features? Abra uma issue com a tag `enhancement`!
