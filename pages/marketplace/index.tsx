import React from 'react'
import { Card, Container, LinkItem, SEO } from '@components/ui'
import type { ICard } from '@components/ui'
import ROUTES from '@constants/routes.json'

export default function Marketplace({ cards }: { cards: ICard[] }) {
  const cardsRef = React.useRef(cards)
  const [, trigger] = React.useReducer((prev) => !prev, false)
  const lastCardRef = React.useRef(null)
  const populateWithDummyCards = () => {
    const tmp = [...cardsRef.current]
    const startingIndex = tmp.length
    cardsRef.current.push(
      ...new Array(20).fill('').map((card, i) => {
        card = {
          id: startingIndex + i + 1,
          name: 'Loading',
          isLoading: true,
          media: '',
        }
        return card
      })
    )
    trigger()
    return startingIndex
  }
  const fetchAndHydrate = async (startingIndex: number) => {
    const result = await fetch('https://rickandmortyapi.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            characters{
              results{
                id
                name
                media:image
              }
            }
          }
          
          `,
      }),
    })

    if (!result.ok) {
      console.error(result)
      return {}
    }

    const { data } = await result.json()
    const cards = data.characters.results
    for (let i = 0; i < 20; i++) {
      cardsRef.current[startingIndex + i] = cards[i]
    }
    trigger()
  }
  React.useEffect(() => {
    if (lastCardRef.current) {
      const observer = new IntersectionObserver(
        ([{ isIntersecting, target }]) => {
          if (isIntersecting) {
            const startingIndex = populateWithDummyCards()
            setTimeout(() => fetchAndHydrate(startingIndex), 1000)
            observer.unobserve(target)
          }
        }
      )
      observer.observe(lastCardRef.current)
    }
  }, [lastCardRef.current])
  return (
    <Container hasPaddingX hasPaddingY>
      <SEO title={'Marketplace'} />
      <h1 className="text-center text-7xl font-semibold text-gray-800">
        [Marketplace]
      </h1>
      <div className="mt-10 grid gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
        {cardsRef.current.map((card, i) => {
          if (i === cardsRef.current.length - 1) {
            return (
              <div ref={lastCardRef} className="w-full h-full" key={i}>
                <LinkItem slug={`${ROUTES.MARKETPLACE.slug}/${card.id}`}>
                  <Card {...card} />
                </LinkItem>
              </div>
            )
          }
          return (
            <LinkItem slug={`${ROUTES.MARKETPLACE.slug}/${card.id}`} key={i}>
              <Card {...card} />
            </LinkItem>
          )
        })}
      </div>
    </Container>
  )
}

export const getStaticProps = async () => {
  // const result = await fetch(
  //   `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       query: `
  //       query {
  //         cardCollection {
  //           items {
  //             id
  //             media: cardMedia{
  //               url
  //             }
  //             name
  //             price
  //           }
  //         }
  //       }
  //       `,
  //     }),
  //   }
  // )

  // if (!result.ok) {
  //   console.error(result)
  //   return {}
  // }

  // const { data } = await result.json()
  // const cards = data.cardCollection.items

  const result = await fetch('https://rickandmortyapi.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          characters{
            results{
              id
              name
              media:image
            }
          }
        }
        
        `,
    }),
  })

  if (!result.ok) {
    console.error(result)
    return {}
  }

  const { data } = await result.json()
  const cards = data.characters.results

  return {
    props: { cards },
  }
}
