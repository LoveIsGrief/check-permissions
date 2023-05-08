import {expect, test} from '@jest/globals'
import {
  getRecentApprovals,
  GetReviewsResponse,
  LastPushedDateResponse,
  Review,
  ReviewResponse
} from '../../../src/utils/pullRequest'
import {mockMultipleGraphQlOctokit} from '../../common'
import * as util from 'util'

test('getRecentApprovals success', async function () {
  let minute = 10
  const dateFormat = '2023-05-05T18:%s:34.094Z'
  const dateString = util.format(dateFormat, minute + 2) // Cut off at Mayol
  //  TODO make test simpler to read
  const reviews: ReviewResponse[] = ['Jayaz', 'Kooma', 'Mayol', 'Quanl', 'Atacc'].map(name => {
    return {
      state: 'APPROVED',
      author: {login: name},
      publishedAt: util.format(dateFormat, minute++)
    }
  })
  const octokit = mockMultipleGraphQlOctokit<GetReviewsResponse | LastPushedDateResponse>([
    {
      repository: {
        pullRequest: {
          reviews: {
            nodes: reviews
          }
        }
      }
    },
    {
      repository: {
        pullRequest: {
          commits: {
            nodes: [
              {
                committedDate: dateString,
                authoredDate: dateString,
                pushedDate: dateString
              }
            ]
          }
        }
      }
    }
  ])
  minute = 12
  const expectedApprovals: Review[] = ['Mayol', 'Quanl', 'Atacc'].map(name => {
    return {
      state: 'APPROVED',
      author: {login: name},
      publishedAt: new Date(util.format(dateFormat, minute++))
    }
  })
  const approvals = await getRecentApprovals(1, 'someRepo', 'someOwner', octokit)
  expect(approvals).toStrictEqual(expectedApprovals)
})
