import {expect, test} from '@jest/globals'
import {getReviews, GetReviewsResponse, Review} from '../../../src/utils/pullRequest'
import {mockGraphQlOctokit} from '../../common'

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
