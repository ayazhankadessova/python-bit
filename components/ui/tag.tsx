import Link from 'next/link'
import { badgeVariants } from './badge'
import React from 'react'
// import { slug } from 'github-slugger'

interface TagProps {
  tag: string
  current?: boolean
  count?: number
}
export function Tag({ tag, current, count }: TagProps) {
  return (
    <Link
      className={badgeVariants({
        variant: 'outline',
        className:
          'no-underline rounded-full border-black hover:bg-secondary/60 text-foreground font-normal',
      })}
      //   href={`/tags/${slug(tag)}`}
      href={`/tags/`}
    >
      {tag} {count ? `(${count})` : null}
    </Link>
  )
}
