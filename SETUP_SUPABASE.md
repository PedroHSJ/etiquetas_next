# Configuração do Supabase para o Sistema de Etiquetas

## 1. Configuração Inicial

### Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha uma organização e preencha:
   - Nome do projeto: `sistema-etiquetas`
   - Database Password: (gere uma senha segura)
   - Região: South America (São Paulo)

### Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 2. Executar Migrações

### Via SQL Editor (Recomendado)

1. No painel do Supabase, vá para "SQL Editor"
2. Cole o conteúdo do arquivo `database/migrations/001_initial_tables.sql`
3. Execute o script clicando em "Run"

### Via CLI do Supabase (Opcional)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Inicializar projeto local
supabase init

# Configurar remote
supabase link --project-ref your-project-id

# Aplicar migrações
supabase db push
```

## 3. Inserir Dados de Exemplo

No SQL Editor, execute o arquivo `database/seeds/001_sample_data.sql`:

1. Copie o conteúdo do arquivo
2. Cole no SQL Editor
3. Execute o script

Isso criará:

- 1 Organização de exemplo
- 3 Departamentos
- 8 Categorias de produtos
- 10 Produtos de exemplo
- 3 Templates padrão de etiquetas
- 2 Etiquetas de exemplo

## 4. Configurar Autenticação

### Configurar Providers

1. No painel do Supabase, vá para "Authentication" > "Providers"
2. Configure Email (já habilitado por padrão)
3. Opcional: Configure Google, GitHub, etc.

### Configurar URLs

Em "Authentication" > "URL Configuration":

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### Configurar Email Templates (Opcional)

Em "Authentication" > "Email Templates", personalize:

- Confirm signup
- Magic link
- Change email address
- Reset password

## 5. Row Level Security (RLS)

As políticas RLS já estão configuradas nas migrações. Elas garantem que:

- Usuários só veem dados da sua organização
- Admins e managers podem criar/editar produtos
- Todos os usuários podem criar etiquetas
- Usuários só podem editar suas próprias etiquetas (ou admins podem editar todas)

## 6. Testar Conexão

### Verificar Tabelas

No SQL Editor, execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Deve retornar as tabelas:

- organizations
- departments
- user_profiles
- product_categories
- products
- label_templates
- labels
- label_prints

### Verificar Dados

```sql
SELECT name FROM organizations;
SELECT name FROM product_categories;
SELECT name FROM products LIMIT 5;
```

## 7. Configurar Cliente Supabase

O arquivo `src/lib/supabaseClient.ts` já está configurado. Apenas certifique-se de que as variáveis de ambiente estão corretas.

## 8. Políticas de Backup

### Backup Automático

O Supabase faz backup automático. Para projetos de produção:

1. Vá para "Settings" > "Database"
2. Configure "Point in Time Recovery" (plano Pro)

### Backup Manual

```bash
# Via CLI
supabase db dump --file backup.sql

# Via interface
# Database > Backups > Download backup
```

## 9. Monitoramento

### Configurar Alertas

1. "Settings" > "Database" > "Usage"
2. Configure alertas para:
   - Uso de storage
   - Número de connections
   - Rate limits

### Dashboard

Monitore em tempo real:

- "Database" > "API" para logs de API
- "Database" > "Logs" para logs SQL
- "Authentication" > "Users" para atividade de usuários

## 10. Produção

### Configurar Domínio Personalizado

1. "Settings" > "Custom Domains"
2. Configure DNS CNAME
3. Aguarde verificação SSL

### Variáveis de Ambiente Produção

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Configurar Limites

1. "Settings" > "Database" > "Connection limits"
2. "Settings" > "API" > "Rate limits"

## 11. Troubleshooting

### Problemas Comuns

**Erro de RLS Policy**

- Verifique se o usuário está autenticado
- Confirme se as políticas RLS estão ativas
- Teste com service role key temporariamente

**Conexão Refused**

- Verifique URLs nas variáveis de ambiente
- Confirme se as chaves estão corretas
- Teste conectividade: `ping your-project-id.supabase.co`

**Dados não aparecem**

- Verifique se o organization_id está correto
- Confirme se o usuário tem user_profile criado
- Teste queries diretamente no SQL Editor

### Logs Úteis

```sql
-- Ver políticas RLS ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Ver usuário atual
SELECT auth.uid(), auth.role();

-- Ver dados do user_profile
SELECT * FROM user_profiles WHERE id = auth.uid();
```

## 12. Scripts Úteis

### Resetar dados de teste

```sql
-- Limpar etiquetas
DELETE FROM labels WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

-- Limpar produtos
DELETE FROM products WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

-- Limpar templates
DELETE FROM label_templates WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

-- Re-executar seeds
-- Execute novamente o arquivo 001_sample_data.sql
```

### Criar usuário admin

```sql
-- Primeiro, o usuário deve se registrar via interface
-- Depois, promover para admin:
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'user-uuid-here';
```
