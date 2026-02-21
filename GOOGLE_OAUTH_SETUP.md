# Configuração do Google OAuth - Better Auth

## ⚠️ AÇÃO NECESSÁRIA

Você precisa atualizar os **Redirect URIs** no Google Cloud Console para o Better Auth funcionar.

## Passos para configurar:

### 1. Acesse o Google Cloud Console

🔗 https://console.cloud.google.com/apis/credentials

### 2. Encontre suas credenciais OAuth 2.0

- Localize o Client ID: `710141213801-dk70p1hvr64v9bfq2lmjui3ia0a9jouj.apps.googleusercontent.com`
- Clique para editar

### 3. Atualize os **Authorized redirect URIs**

Adicione os seguintes URIs (mantenha os existentes e adicione estes):

```
http://127.0.0.1:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3001/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

**Nota:** O Better Auth usa a rota `/api/auth/callback/google` para processar o retorno do Google OAuth.

### 4. Atualize os **Authorized JavaScript origins**

Certifique-se de ter:

```
http://127.0.0.1:3000
http://localhost:3000
http://127.0.0.1:3001
http://localhost:3001
```

### 5. Salve as alterações

Clique em **"Save"** no Google Cloud Console.

---

## Como funciona agora

- **Before**: Configurado para Supabase (`/auth/v1/callback`)
- **Now**: Configurado para Better Auth (`/api/auth/callback/google`)

## Testando

Após atualizar no Google Cloud Console:

1. Reinicie o servidor: `npm run dev`
2. Acesse: http://localhost:3001/login
3. Clique em "Continuar com Google"
4. Você será redirecionado para o Google
5. Após autorizar, voltará para `/dashboard`

## Troubleshooting

Se você ver erro `redirect_uri_mismatch`:

- Confirme que adicionou TODOS os URIs listados acima
- Aguarde 1-2 minutos (pode haver cache do Google)
- Limpe o cache do navegador ou use aba anônima
