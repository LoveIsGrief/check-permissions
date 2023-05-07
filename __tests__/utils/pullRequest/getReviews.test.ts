import {expect, test, describe, jest} from '@jest/globals'
import {getReviews, GetReviewsResponse} from '../../../src/utils/pullRequest'
import {OctokitType} from '../../../src/utils/github'
import {RequestParameters, GraphQlResponse} from '@octokit/graphql/dist-types/types'
import {EndpointInterface} from '@octokit/types'
import {FunctionLike} from 'jest-mock'

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
  expect(reviews).toStrictEqual([{author: {login: 'Jayaz'}, publishedAt: date, state: 'APPROVED'}])
})

interface MyMock<T extends FunctionLike> extends jest.Mock<T> {
  defaults: (newDefaults: RequestParameters) => MyMock<T>

  endpoint: EndpointInterface
}

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
