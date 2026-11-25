/**
 * 站点路径工具。
 * `import.meta.env.BASE_URL` 在开启 trailingSlash 时可能带尾斜杠（如 `/dsa/`），
 * 直接拼接 `${base}/xxx` 会产生 `/dsa//xxx` 双斜杠。这里统一规范为「无尾斜杠」的
 * 绝对前缀，再在需要处自行补 `/`，保证产物里的链接和资源都是干净的 `/dsa/...`。
 */
export const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';

export function siteUrl(path = '') {
  if (!path) return `${BASE_URL}/`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path; // 外链原样返回
  return `${BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
