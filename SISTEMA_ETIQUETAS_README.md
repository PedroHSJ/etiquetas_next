# Sistema de Etiquetas - Documentação

## Visão Geral

O Sistema de Etiquetas é uma aplicação web responsiva que permite aos usuários criar e imprimir etiquetas para produtos organizados em grupos. O sistema é otimizado para dispositivos móveis e oferece uma interface intuitiva para seleção de grupos, produtos e criação de etiquetas.

## Funcionalidades Principais

### 1. Seleção de Grupos
- Lista todos os grupos disponíveis no banco de dados
- Interface de busca para filtrar grupos
- Cards clicáveis com informações do grupo

### 2. Seleção de Produtos
- Após selecionar um grupo, lista todos os produtos associados
- Busca em tempo real para encontrar produtos específicos
- Navegação intuitiva com botão de voltar

### 3. Criação de Etiquetas
- Formulário para confirmar dados da etiqueta
- Campo para quantidade (padrão: 1)
- Campo opcional para observações
- Validação de dados antes da criação

### 4. Impressão Automática
- Geração automática de etiquetas no formato 50mm x 30mm
- Otimizado para impressoras de etiquetas adesivas
- Formato profissional com informações organizadas
- Janela de impressão automática

### 5. Histórico de Etiquetas
- Lista das últimas etiquetas criadas
- Informações sobre grupo, produto, quantidade e data
- Acesso rápido ao histórico de uso

## Estrutura do Banco de Dados

### Tabela: `etiquetas`
```sql
CREATE TABLE etiquetas (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    grupo_id INTEGER NOT NULL REFERENCES grupos(id),
    quantidade INTEGER DEFAULT 1,
    data_impressao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id),
    organizacao_id UUID REFERENCES organizacoes(id),
    status VARCHAR(50) DEFAULT 'impresso',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relacionamentos
- `produto_id` → `produtos.id`
- `grupo_id` → `grupos.id`
- `usuario_id` → `auth.users.id`
- `organizacao_id` → `organizacoes.id`

## Arquitetura da Aplicação

### Componentes Principais

1. **EtiquetaSelectorWrapper** - Componente wrapper que escolhe automaticamente entre versão desktop e mobile
2. **EtiquetaSelector** - Versão desktop com layout otimizado para telas maiores
3. **MobileEtiquetaSelector** - Versão mobile com interface touch-friendly
4. **EtiquetaPrinter** - Sistema de impressão avançado para etiquetas adesivas

### Hooks Personalizados

1. **useEtiquetas** - Gerencia estado das etiquetas, grupos e produtos
2. **useMobile** - Detecta dispositivos móveis para renderização responsiva

### Serviços

1. **EtiquetaService** - Operações CRUD para etiquetas, grupos e produtos

## Fluxo de Uso

### 1. Acesso à Tela
- Usuário navega para `/etiquetas`
- Sistema detecta automaticamente se é dispositivo móvel
- Renderiza interface apropriada

### 2. Seleção de Grupo
- Usuário vê lista de grupos disponíveis
- Pode usar busca para filtrar grupos
- Clica no grupo desejado

### 3. Seleção de Produto
- Sistema carrega produtos do grupo selecionado
- Usuário pode buscar produtos específicos
- Clica no produto desejado

### 4. Confirmação e Criação
- Usuário confirma dados da etiqueta
- Define quantidade e observações (opcional)
- Clica em "Criar e Imprimir"

### 5. Impressão Automática
- Sistema salva etiqueta no banco
- Abre janela de impressão otimizada
- Etiqueta é impressa automaticamente
- Usuário retorna à tela inicial

## Otimizações para Mobile

### Interface Touch-Friendly
- Botões grandes e espaçados
- Cards com feedback visual ao toque
- Navegação com gestos intuitivos

### Layout Responsivo
- Header fixo com navegação
- Busca integrada no header
- Indicadores de progresso visuais
- Histórico compacto na parte inferior

### Performance
- Carregamento lazy de dados
- Estados de loading visuais
- Tratamento de erros amigável
- Cache de dados para melhor experiência

## Formato de Impressão

### Dimensões
- **Largura**: 50mm
- **Altura**: 30mm
- **Margens**: 0mm (otimizado para etiquetas adesivas)

### Conteúdo
1. **Header**: Nome do grupo
2. **Produto**: Nome do produto (destaque)
3. **Quantidade**: Quantidade em destaque
4. **Observações**: Texto opcional
5. **Área de Código de Barras**: Reservada para futuras implementações
6. **Footer**: Data e hora de criação

### Estilos
- Fonte Arial para melhor legibilidade
- Hierarquia visual clara
- Cores otimizadas para impressão
- Layout centralizado e organizado

## Configuração de Impressora

### Requisitos
- Impressora de etiquetas adesivas
- Suporte a papel de 50mm de largura
- Driver configurado para o sistema operacional

### Configurações Recomendadas
- **Tipo de papel**: Etiquetas adesivas
- **Tamanho**: 50mm x 30mm
- **Margens**: 0mm
- **Orientação**: Retrato
- **Qualidade**: Normal ou alta

## Tratamento de Erros

### Erros de Rede
- Mensagens amigáveis para o usuário
- Botão para tentar novamente
- Fallback para dados locais quando possível

### Erros de Banco
- Validação de dados antes do envio
- Rollback automático em caso de falha
- Logs detalhados para debugging

### Erros de Impressão
- Fallback para visualização da etiqueta
- Opção de salvar para impressão posterior
- Suporte para diferentes formatos de impressão

## Segurança

### Autenticação
- Usuário deve estar logado
- Verificação de permissões por organização
- Isolamento de dados entre organizações

### Validação
- Sanitização de inputs
- Validação de tipos de dados
- Prevenção de SQL injection

### Auditoria
- Log de todas as operações
- Rastreamento de usuário e timestamp
- Histórico de modificações

## Manutenção e Suporte

### Logs
- Logs de erro detalhados
- Logs de performance
- Logs de auditoria

### Monitoramento
- Métricas de uso
- Alertas de erro
- Dashboard de status

### Backup
- Backup automático do banco
- Versionamento de dados
- Recuperação de desastres

## Futuras Implementações

### Funcionalidades Planejadas
1. **Códigos de Barras**: Integração com bibliotecas de geração de códigos
2. **Templates Personalizáveis**: Etiquetas com layouts customizáveis
3. **Impressão em Lote**: Múltiplas etiquetas de uma vez
4. **Sincronização Offline**: Funcionamento sem internet
5. **Relatórios**: Estatísticas de uso e impressão

### Melhorias Técnicas
1. **PWA**: Aplicação web progressiva
2. **Cache Inteligente**: Otimização de performance
3. **Notificações Push**: Alertas em tempo real
4. **Integração com APIs**: Conectividade com sistemas externos

## Suporte e Contato

Para suporte técnico ou dúvidas sobre o sistema:
- **Email**: suporte@empresa.com
- **Documentação**: [Link para documentação completa]
- **Repositório**: [Link para código fonte]

---

*Última atualização: Janeiro 2025*
*Versão: 1.0.0*
