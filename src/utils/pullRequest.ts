import github from '@actions/github'

export interface Author {
  login: string
}

interface _Review {
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

/**
 * Gets the 100 last approved reviews of a pull request
 */
export async function getReviews(prNumber: number): Promise<Review[]> {
  const response = await github.getOctokit('').graphql({
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
    repoName: github.context.repo.repo,
    repoOwner: github.context.repo.owner,
    prNumber
  })
  const reviews: _Review[] = response.repository.pullRequest.reviews.nodes
  return reviews.map(review => {
    return {
      ...review,
      publishedAt: new Date(review.publishedAt)
    }
  })
}

/**
 * When was the last push done to the PR
 */
export async function getLastPushedDate(prNumber: number): Promise<Date> {
  const response = await github.getOctokit('').graphql({
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
    repoName: github.context.repo.repo,
    repoOwner: github.context.repo.owner,
    prNumber
  })
  const commit: Commit = response.repository.pullRequest.nodes[0]

  return new Date(commit.pushedDate)
}

/**
 * Gets the list of PR reviews that approved a PR since the last push to it
 */
export async function getRecentApprovals(prNumber: number): Promise<Review[]> {
  const reviews = await getReviews(prNumber)
  const lastPushedDate = await getLastPushedDate(prNumber)
  return reviews.filter(review => review.publishedAt > lastPushedDate)
}

interface ChangedFile {
  path: string
}

/**
 * Which files were changed in this PR
 */
export async function getChangedFiles(prNumber: number): Promise<string[]> {
  const octokit = github.getOctokit('')
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
  let response = await octokit.graphql({
    query,
    repoName: github.context.repo.repo,
    repoOwner: github.context.repo.owner,
    prNumber
  })

  let files: ChangedFile[] = response.repository.pullRequest.files.nodes
  // Walk through pages
  while (response.repository.pullRequest.files.pageInfo.hasNextPage) {
    const page = response.repository.pullRequest.files.pageInfo.endCursor
    response = await octokit.graphql({
      query,
      repoName: github.context.repo.repo,
      repoOwner: github.context.repo.owner,
      prNumber,
      page
    })
    files = files.concat(response.repository.pullRequest.files.nodes)
  }
  return files.map(file => file.path)
}
