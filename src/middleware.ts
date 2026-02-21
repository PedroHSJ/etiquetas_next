import { NextResponse, type NextRequest } from "next/server";

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  "/login",
  "/register",
  "/auth", // Rotas de auth
  "/api/auth", // Better Auth API
  "/api/public", // API pública se houver
  "/_next", // Next.js internals
  "/favicon.ico",
  "/public", // Assets públicos
];

// Extensões de arquivo estático para ignorar
const staticFileExtensions = [
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".css",
  ".js",
  ".json",
  ".woff",
  ".woff2",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar arquivos estáticos e imagens
  if (staticFileExtensions.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // 2. Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 3. Verificar sessão via Cookie
  // Better Auth usa cookies HTTP-only para gerenciar sessões
  // O nome do cookie padrão é "better-auth.session_token"
  // Em produção pode ter prefixo secure (__Secure-)

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    // Se não tiver token de sessão e a rota não for pública, redirecionar para login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Opcional: Salvar redirect URL para redirecionar de volta após login
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Se tiver token, permitimos o acesso.
  // A validação real da validade/expiração do token será feita pelo servidor (API/Server Components)
  // ao tentar acessar dados protegidos ou renderizar páginas sensíveis.
  // O middleware atua apenas como primeira gatekeeper de UI.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - although we might want middleware on some)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
