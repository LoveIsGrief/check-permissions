import {expect, test} from '@jest/globals'
import {ChangedFilesResponse, getChangedFiles} from '../../../src/utils/pullRequest'
import {mockGraphQlOctokit} from '../../common'

test('getChangedFiles single page', async function () {
  const octokit = mockGraphQlOctokit<ChangedFilesResponse>({
    repository: {
      pullRequest: {
        files: {
          nodes: [{path: '.github/dependabot.yml'}],
          pageInfo: {
            hasNextPage: false
          }
        }
      }
    }
  })
  const changedFiles = await getChangedFiles(1, 'someRepo', 'someOwner', octokit)
  const expectedChangedFiles: string[] = ['.github/dependabot.yml']
  expect(changedFiles).toStrictEqual(expectedChangedFiles)
})
