import Permission from './Permission'
import {getPrNumber, getRecentApprovals} from '../utils/pullRequest'
import {getOctoKit} from '../utils/github'
import github from '@actions/github'

/**
 * A check to make sure the affected pull request has reached the minimum amount of approvals
 */
export default class PullApprovalCount extends Permission {
  readonly minApprovers: number

  constructor({minApprovers}: {minApprovers: number}) {
    super()
    this.minApprovers = minApprovers
  }

  async hasPermission(): Promise<boolean> {
    const prNumber = getPrNumber()
    return (
      (
        await getRecentApprovals(
          prNumber,
          github.context.repo.repo,
          github.context.repo.owner,
          getOctoKit()
        )
      ).length >= this.minApprovers
    )
  }
}
