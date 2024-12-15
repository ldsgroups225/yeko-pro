import Jabber from 'jabber'
import { memo } from 'react'
import { Paragraph } from '../layout/paragraph'

interface FakeParagraphsProps {
  count: number
  words: number
}

const jabber = new Jabber()

export const FakeParagraphs = memo(({ count, words }: FakeParagraphsProps) => {
  const fakeParagraphs = Array.from({ length: count }).map((_, i) => ({
    id: i.toString(),
  }))

  return (
    <>
      {fakeParagraphs.map(el => (
        <Paragraph key={el.id}>{jabber.createParagraph(words)}</Paragraph>
      ))}
    </>
  )
})
