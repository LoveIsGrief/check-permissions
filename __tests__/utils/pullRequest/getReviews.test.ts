import {expect, jest, test} from '@jest/globals'
import {getReviews, GetReviewsResponse, Review} from '../../../src/utils/pullRequest'
import {OctokitType} from '../../../src/utils/github'

test('getReviews success', async function () {
  const dateString = '2023-05-05T18:38:34.094Z'
  const date = new Date(dateString)
  const octokit = mockGraphQlOctokit<GetReviewsResponse>({
    repository: {
      pullRequest: {
        reviews: {
          nodes: [{state: 'APPROVED', author: {login: 'Jayaz'}, publishedAt: dateString}]
        }
      }
    }
  })
  const reviews = await getReviews(1, 'someRepo', 'someOwner', octokit)
  const expectedReviews: Review[] = [
    {author: {login: 'Jayaz'}, publishedAt: date, state: 'APPROVED'}
  ]
  expect(reviews).toStrictEqual(expectedReviews)
})

/**
 * Make an octokit object with a graphql method that returns a given response
 */
function mockGraphQlOctokit<T>(response: T): OctokitType {
  const graphQlMock = jest.fn()
  graphQlMock.mockImplementation(async _ => response)
  return {
    graphql: graphQlMock as unknown as OctokitType['graphql']
  } as unknown as OctokitType
}
