import { getPayload } from 'payload'
// @ts-expect-error TypeScript might complain about extension, but tsx needs it here
import config from '../payload.config.ts'

async function run() {
  const payload = await getPayload({ config })
  console.log('Payload initialized.')

  const insights = await payload.find({
    collection: 'insights',
    limit: 1000,
  })

  console.log(`Found ${insights.docs.length} insights. Publishing them...`)

  for (const insight of insights.docs) {
    if (insight._status !== 'published') {
      try {
        await payload.update({
          collection: 'insights',
          id: insight.id,
          data: {
            _status: 'published'
          } as any
        })
        console.log(` - Published Insight: ${insight.title}`)
      } catch (e: any) {
        console.error(` - Failed to publish Insight: ${e.message}`)
      }
    } else {
      console.log(` - Insight already published: ${insight.title}`)
    }
  }

  console.log('Done.')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
