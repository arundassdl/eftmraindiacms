import 'dotenv/config'

type SeedRecord = Record<string, unknown>

async function importTestimonials() {
  try {
    Object.assign(process.env, { NODE_ENV: 'production' })

    const [{ getPayload }, { default: configPromise }, { default: testimonialsSeed }, { seedCollectionData }] =
      await Promise.all([
        import('payload'),
        import('../payload.config'),
        import('../src/seeds/testimonials.json'),
        import('../src/lib/seedCollectionData'),
      ])

    const payload = await getPayload({
      config: configPromise,
    })
    const mediaCache = new Map<string, number | string | null>()

    payload.logger.info('Importing testimonials...')
    await seedCollectionData(
      'testimonials',
      testimonialsSeed as SeedRecord[],
      { payload, req: undefined as never },
      mediaCache
    )

    payload.logger.info(
      `Testimonials import complete (${testimonialsSeed.length} seed records).`
    )
    process.exit(0)
  } catch (error) {
    console.error('Testimonials import failed:', error)
    process.exit(1)
  }
}

void importTestimonials()
