/**
 * Utility functions for handling paths in GitHub Pages environment
 */

/**
 * Получает правильный путь к данным с учетом базового пути
 */
export function getDataPath(path: string): string {
  // В продакшене всегда используем /torah-v2/
  const base = import.meta.env.PROD ? '/torah-v2/' : (import.meta.env.BASE_URL || '/');
  const fullPath = `${base}data/${path}`.replace(/\/+/g, '/');
  console.log('🔗 getDataPath:', path, '->', fullPath);
  return fullPath;
}
