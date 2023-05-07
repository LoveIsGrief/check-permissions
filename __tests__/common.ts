import {OctokitType} from '../src/utils/github'
import {jest} from '@jest/globals'

/**
 * Make an octokit object with a graphql method that returns a given response
 */
export function mockGraphQlOctokit<T>(response: T): OctokitType {
  const graphQlMock = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  graphQlMock.mockImplementation(async _ => response)
  return {
    graphql: graphQlMock as unknown as OctokitType['graphql']
  } as unknown as OctokitType
}

/**
 * Make an octokit object with a graphql method that returns a response per call
 */
export function mockMultipleGraphQlOctokit<T>(responses: T[]): OctokitType {
  let graphQlMock = jest.fn()
  graphQlMock.mock.calls
  for (const response of responses) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    graphQlMock = graphQlMock.mockImplementationOnce(async _ => response)
  }
  return {
    graphql: graphQlMock as unknown as OctokitType['graphql']
  } as unknown as OctokitType
}
