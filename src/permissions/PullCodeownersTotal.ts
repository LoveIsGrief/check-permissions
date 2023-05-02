import Permission from './Permission'
import {getChangedFiles, getPrNumber, getRecentApprovals} from '../utils/pullRequest'
import core from '@actions/core'
import Codeowners from 'codeowners'
import {getOctoKit} from '../utils/github'

type FilePath = string
type FileOwner = string
/** Mapping of file to its owners in the CodeOwner file (if any) */
type FileOwnerMap = Map<FilePath, FileOwner[]>

/**
 * Checks whether each file has been approved by a minimum number of its owners
 */
export default class PullCodeownersTotal extends Permission {
  readonly minApprovers: number

  constructor({minApprovers}: {minApprovers: number}) {
    super()
    this.minApprovers = minApprovers
  }

  async hasPermission(): Promise<boolean> {
    const prNumber = getPrNumber()
    const octokit = getOctoKit()
    const approvals = await getRecentApprovals(prNumber, octokit)

    /** Who approved the PR */
    const approvers = new Set(approvals.map(review => review.author.login))

    const changedFiles = await getChangedFiles(prNumber, octokit)
    const fileToOwner = this.mapCodeOwners(changedFiles)
    const unapprovedFiles = []
    for (const [file, owners] of fileToOwner) {
      if (!this.isFileApproved(file, owners, approvers)) {
        unapprovedFiles.push(file)
      }
    }

    // Check that each file has been approved
    if (unapprovedFiles.length > 0) {
      core.error(`Missing approvals for ${unapprovedFiles.join(',')}`)
      return false
    }

    return true
  }

  /**
   * Maps each changed file to a list of owners from the codeowners file
   */
  mapCodeOwners(changedFiles: FilePath[]): FileOwnerMap {
    const co = new Codeowners()
    return new Map(changedFiles.map(changedFile => [changedFile, co.getOwner(changedFile)]))
  }

  /**
   * Has the approval criteria been met for the file
   *
   * @param path with in the repo
   * @param codeOwners CODEOWNERS of the files
   * @param approvers who approved the PR
   */
  isFileApproved(path: string, codeOwners: string[], approvers: Set<string>): boolean {
    // Changed a file that isn't owned
    if (codeOwners.length === 0) {
      return true
    }
    let approverCount = 0
    for (const codeOwner of codeOwners) {
      if (approvers.has(codeOwner)) {
        approverCount += 1
      }
    }
    return this.hasMinimumApproval(approverCount, codeOwners)
  }

  /**
   * Depending on the class, has the minimum approval criteria been reached
   *
   * In this case, the minimum is an integer
   *
   * @param approverCount How many code owners approved
   * @param codeowners The code owners themselves
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasMinimumApproval(approverCount: number, codeowners: string[]): boolean {
    return approverCount > this.minApprovers
  }
}
