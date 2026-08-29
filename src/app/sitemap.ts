import type { MetadataRoute } from 'next'

import { getCaseStudies } from '@/lib/case-studies'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caseStudies = await getCaseStudies()
  const now = new Date()

  const routes = [
    '' /* This is equivalent to / */,
    '/contact',
    '/experiment/no-cache',
    '/experiment/server-cache',
    '/experiment/edge-cache',
    ...caseStudies.map(caseStudy => `/case-study/${caseStudy.slug}`)
  ]

  return routes.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8
  }))
}
