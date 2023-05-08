import github from '@actions/github'
import {OctokitType} from './github'

export interface Author {
  login: string
}

export interface ReviewResponse {
  state: string
  author: Author
  publishedAt: string
}

export interface Review {
  state: string
  author: Author
  publishedAt: Date
}
interface Commit {
  committedDate: string
  authoredDate: string
  pushedDate: string
}

export function getPrNumber(): number {
  const number = github.context.payload.pull_request?.number
  if (number === undefined) {
    throw new Error('No PR in github context')
  }
  return number
}

export interface GetReviewsResponse {
  repository: {
    pullRequest: {
      reviews: {
        nodes: ReviewResponse[]
      }
    }
  }
}
/**
 * Gets the 100 last approved reviews of a pull request
 */
export async function getReviews(
  prNumber: number,
  repoName: string,
  repoOwner: string,
  octokit: OctokitType
): Promise<Review[]> {
  const response: GetReviewsResponse = await octokit.graphql({
    query: `
        query($repoName: String!, $repoOwner: String!, $prNumber: Int!){
          repository(name: $repoName, owner: $repoOwner) {
            pullRequest(number: $prNumber) {
              title
                number
                reviews(states: APPROVED, last: 100) {
                  nodes {
                    state
                    author {
                      login
                    }
                    publishedAt
                  }
                }
            }
          }
        }`,
    repoName,
    repoOwner,
    prNumber
  })
  const reviews = response.repository.pullRequest.reviews.nodes
  return reviews.map(review => {
    return {
      ...review,
      publishedAt: new Date(review.publishedAt)
    }
  })
}

export interface LastPushedDateResponse {
  repository: {
    pullRequest: {
      commits: {
        nodes: Commit[]
      }
    }
  }
}
/**
 * When was the last push done to the PR
 */
export async function getLastPushedDate(
  prNumber: number,
  repoName: string,
  repoOwner: string,
  octokit: OctokitType
): Promise<Date> {
  const response: LastPushedDateResponse = await octokit.graphql({
    query: `
        query($repoName: String!, $repoOwner: String!, $prNumber: Int!){
          repository(name: $repoName, owner: $repoOwner) {
            pullRequest(number: $prNumber) {
              commits(last: 1) {
                nodes {
                  commit {
                    ... on Commit {
                      committedDate
                      authoredDate
                      pushedDate
                    }
                  }
                }
              }
            }
          }
        }
    `,
    repoName,
    repoOwner,
    prNumber
  })
  const commit: Commit = response.repository.pullRequest.commits.nodes[0]

  return new Date(commit.pushedDate)
}

/**
 * Gets the list of PR reviews that approved a PR since the last push to it
 */
export async function getRecentApprovals(
  prNumber: number,
  repoName: string,
  repoOwner: string,
  octokit: OctokitType
): Promise<Review[]> {
  const reviews = await getReviews(prNumber, repoName, repoOwner, octokit)
  const lastPushedDate = await getLastPushedDate(prNumber, repoName, repoOwner, octokit)
  return reviews.filter(review => review.publishedAt >= lastPushedDate)
}

export interface ChangedFile {
  path: string
}
export interface ChangedFilesResponse {
  repository: {
    pullRequest: {
      files: {
        nodes: ChangedFile[]
        pageInfo: {
          hasNextPage: boolean
          endCursor?: string
        }
      }
    }
  }
}

/**
 * Which files were changed in this PR
 */
export async function getChangedFiles(
  prNumber: number,
  repoName: string,
  repoOwner: string,
  octokit: OctokitType
): Promise<string[]> {
  const query = `
    query ($repoName: String!, $repoOwner: String!, $prNumber: Int!, $page: String!) {
      repository(name: $repoName, owner: $repoOwner) {
        pullRequest(number: $prNumber) {
          files(first:100, after: $page){
            nodes{
              path
            }
            pageInfo{
              startCursor
              endCursor
              hasNextPage
            }
          }
        }
      }
    }`

  let response: ChangedFilesResponse = await octokit.graphql({
    query,
    repoName,
    repoOwner,
    prNumber
  })

  let files: ChangedFile[] = response.repository.pullRequest.files.nodes
  // Walk through pages
  while (response.repository.pullRequest.files.pageInfo.hasNextPage) {
    const page = response.repository.pullRequest.files.pageInfo.endCursor
    response = await octokit.graphql({
      query,
      repoName,
      repoOwner,
      prNumber,
      page
    })
    files = files.concat(response.repository.pullRequest.files.nodes)
  }
  return files.map(file => file.path)
}
