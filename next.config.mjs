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
  async redirects() {
    if (basePath) {
      return []
    }

    return [
      {
        source: '/cms/admin',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/cms/admin/:path*',
        destination: '/admin/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
