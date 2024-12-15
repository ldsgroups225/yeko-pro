import Jabber from 'jabber'
import { memo } from 'react'

interface FakeWordListProps {
  count: number
  length: [number, number]
  capitalize?: boolean
}

const jabber = new Jabber()

export const FakeWordList = memo(({ count, length, capitalize }: FakeWordListProps) => {
  const fakeWords = Array.from({ length: count }).map((_, i) => ({
    id: i.toString(),
  }))

  return (
    <>
      {fakeWords.map(el => (
        <div key={el.id}>
          {jabber.createWord(
            length[0] + Math.floor(Math.random() * (length[1] - length[0])),
            capitalize,
          )}
        </div>
      ))}
    </>
  )
})
