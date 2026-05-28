//import { withPayload } from "@payloadcms/next/withPayload";

const normalizeBasePath = (value) => {
  if (!value || value === '/') {
    return ''
  }

  return value.replace(/\/$/, '')
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_CMS_BASE_PATH)

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_CMS_BASE_PATH: basePath,
  },
}

export default nextConfig
