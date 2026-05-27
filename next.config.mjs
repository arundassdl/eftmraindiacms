//import { withPayload } from "@payloadcms/next/withPayload";

//const basePath = '/eftmraindia/cms'

/** @type {import('next').NextConfig} */
/** const nextConfig = {
  basePath,
  assetPrefix: basePath,
} */

/** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default withPayload(nextConfig);
//

const basePath = process.env.NEXT_PUBLIC_CMS_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_CMS_BASE_PATH: basePath,
  },
}

export default nextConfig
