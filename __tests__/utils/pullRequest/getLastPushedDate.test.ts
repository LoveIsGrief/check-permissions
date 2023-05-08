import {expect, test} from '@jest/globals'
import {getLastPushedDate, LastPushedDateResponse} from '../../../src/utils/pullRequest'
import {mockGraphQlOctokit} from '../../common'

test('getReviews success', async function () {
  const dateString = '2023-05-05T18:38:34.094Z'
  const date = new Date(dateString)
  const octokit = mockGraphQlOctokit<LastPushedDateResponse>({
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
  })
  const lastPushedDate = await getLastPushedDate(1, 'someRepo', 'someOwner', octokit)
  expect(lastPushedDate).toStrictEqual(date)
})
