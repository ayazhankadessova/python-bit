import { defineConfig, defineCollection, s } from 'velite'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const computedFields = <T extends { slug: string }>(data: T) => ({
  ...data,
  slugAsParams: data.slug.split('/').slice(1).join('/'),
})

const tutorials = defineCollection({
  name: 'Tutorial',
  pattern: 'tutorials/**/*.mdx',
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      description: s.string().max(999).optional(),
      date: s.number(),
      order: s.number(),
      published: s.boolean().default(true),
      tags: s.array(s.string()).optional(),
      body: s.mdx(),
      image: s.string().max(99).optional(),
      exercises: s.number(),
      firestoreId: s.string().max(99),
    })
    .transform(computedFields),
})

const projects = defineCollection({
  name: 'Projects',
  pattern: 'projects/**/*.mdx',
  schema: s
    .object({
      slug: s.path(),
      id: s.string().max(99),
      title: s.string().max(99),
      description: s.string().max(999),
      date: s.number(),
      theme: s.string().max(99),
      difficulty: s.string().max(99),
      estimatedTime: s.string().max(99),
      tags: s.array(s.string()),
      image: s.string().max(99),
      published: s.boolean().default(true),
      body: s.mdx(),
    })
    .transform(computedFields),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { tutorials, projects },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark' }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['subheading-anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
    remarkPlugins: [],
  },
})
