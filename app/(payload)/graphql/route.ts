import config from '@payload-config'
import { REST_GET, REST_OPTIONS, REST_POST } from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const OPTIONS = REST_OPTIONS(config)
