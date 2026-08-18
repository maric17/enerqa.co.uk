import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './importMap'
import React from 'react'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  // @ts-expect-error - Payload 3.x type mismatch between ServerFunctionHandler and ServerFunctionClient
  <RootLayout config={config} importMap={importMap} serverFunction={handleServerFunctions}>
    {children}
  </RootLayout>
)

export default Layout
