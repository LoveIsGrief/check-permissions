import PullCodeownersTotal from './PullCodeownersTotal'

/**
 * Checks whether each file has been approved by a minimum percentage of its owners
 */
export default class PullCodeownersPercentage extends PullCodeownersTotal {
  hasMinimumApproval(approverCount: number, codeowners: string[]): boolean {
    const approvalPercentage = approverCount / codeowners.length
    return approvalPercentage > this.minApprovers
  }
}
