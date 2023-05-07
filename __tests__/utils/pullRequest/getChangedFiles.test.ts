import {expect, test, jest} from '@jest/globals'
import {ChangedFilesResponse, getChangedFiles} from '../../../src/utils/pullRequest'
import {mockGraphQlOctokit, mockMultipleGraphQlOctokit} from '../../common'

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

test('getChangedFiles multiple pages', async function () {
  const expectedChangedFiles: string[] = [
    '.github/dependabot.yml',
    'src/permissions/index.ts',
    'src/permissions/Permissions.ts',
    'tsconfig.json'
  ]

  const octokit = mockMultipleGraphQlOctokit<ChangedFilesResponse>(
    // Make a response for each file
    expectedChangedFiles.map((path, index) => {
      return {
        repository: {
          pullRequest: {
            files: {
              nodes: [{path}],
              pageInfo: {
                hasNextPage: index + 1 < expectedChangedFiles.length
              }
            }
          }
        }
      }
    })
  )
  const changedFiles = await getChangedFiles(1, 'someRepo', 'someOwner', octokit)
  expect(changedFiles).toStrictEqual(expectedChangedFiles)
  const graphQlMock = octokit.graphql as unknown as jest.Mock
  expect(graphQlMock.mock.calls.length).toBe(expectedChangedFiles.length)
})
