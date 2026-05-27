export const cmsBasePath = (process.env.NEXT_PUBLIC_CMS_BASE_PATH || "").replace(/\/$/, "");

export function withCmsBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${cmsBasePath}${normalizedPath}`;
}
