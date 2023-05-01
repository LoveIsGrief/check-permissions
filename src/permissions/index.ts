import PullApprovalCount from './PullApprovalCount'
import Permission from './Permission'
import PullCodeownersPercentage from './PullCodeownersPercentage'
import PullCodeownersTotal from './PullCodeownersTotal'

export const REGISTRY = {
  PullApprovalCount,
  PullCodeownersPercentage,
  PullCodeownersTotal
} as Record<string, new (param: unknown) => Permission>
