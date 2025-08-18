/**
 * Utility functions for handling paths in GitHub Pages environment
 */

/**
 * Получает правильный путь к данным с учетом базового пути
 */
export function getDataPath(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}data/${path}`.replace(/\/+/g, '/');
}
