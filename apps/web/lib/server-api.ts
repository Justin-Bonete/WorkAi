// Server-only helpers. The JWT lives in an httpOnly cookie and is attached here, so browser JS never sees it.
export const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const TOKEN_COOKIE = 'workai_token';
