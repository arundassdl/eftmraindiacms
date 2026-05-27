import React from 'react'
import { Inter } from 'next/font/google'
import '@payloadcms/next/css'
import './(payload)/admin-theme.css'
import config from '@payload-config'
import type { ServerFunctionClient } from 'payload'
import {
  RootLayout,
  handleServerFunctions,
} from '@payloadcms/next/layouts'
// @ts-expect-error
import { importMap } from './(payload)/admin/importMap'

type Props = {
  children: React.ReactNode
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-admin-inter',
})

const cmsBasePath = (process.env.NEXT_PUBLIC_CMS_BASE_PATH || '').replace(/\/$/, '')
const faviconPath = `${cmsBasePath}/favicon.png`

export const metadata = {
  icons: {
    icon: faviconPath,
    shortcut: faviconPath,
    apple: faviconPath,
  },
}

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default function Layout({ children }: Props) {
  return (
    <RootLayout
      config={config}
      htmlProps={{
        className: inter.variable,
      }}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}
