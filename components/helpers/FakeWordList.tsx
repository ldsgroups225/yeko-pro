import Jabber from 'jabber'
import { memo } from 'react'

const jabber = new Jabber()

export const FakeWordList = memo(({
  count,
  length,
  capitalize,
}: {
  count: number
  length: [number, number]
  capitalize?: boolean
}) => {
  return (
    <>
      {[...Array.from({ length: count })].map((el: any) => (
        <div key={el?.toString()}>
          {jabber.createWord(
            length[0] + Math.floor(Math.random() * (length[1] - length[0])),
            capitalize,
          )}
        </div>
      ))}
    </>
  )
})
