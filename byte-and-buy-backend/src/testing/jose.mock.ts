/**
 * Stub de `jose` para el entorno de pruebas.
 *
 * `jose` se publica como ESM puro y Jest (con ts-jest en modo CommonJS) no lo
 * parsea. En las pruebas unitarias nunca ejecutamos la verificación real de
 * tokens (el guard no corre al invocar los controladores directamente), así que
 * basta con exponer las funciones que importa `SupabaseAuthGuard` como stubs.
 */
export const jwtVerify = jest.fn();
export const createRemoteJWKSet = jest.fn();
export const decodeProtectedHeader = jest.fn();
