import Jabber from 'jabber'
import { memo } from 'react'
import { Paragraph } from '../layout/paragraph'

const jabber = new Jabber()

export const FakeParagraphs = memo(({
  count,
  words,
}: {
  count: number
  words: number
}) => {
  return (
    <>
      {[...Array.from({ length: count })].map((el: any) => (
        <Paragraph key={el?.toString()}>{jabber.createParagraph(words)}</Paragraph>
      ))}
    </>
  )
})
