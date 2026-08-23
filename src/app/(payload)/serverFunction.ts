'use server'

import type { ServerFunctionClientArgs } from 'payload'
import config from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'

export const serverFunction = async (args: ServerFunctionClientArgs) => {
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}
