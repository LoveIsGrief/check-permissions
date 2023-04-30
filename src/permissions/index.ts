import PullApprovalCount from './PullApprovalCount'
import Permission from './Permission'
import PullCodeownersPercentage from './PullCodeownersPercentage'
import PullCodeownersTotal from './PullCodeownersTotal'

export const REGISTRY = {
  PullApprovalCount,
  PullCodeownersPercentage,
  PullCodeownersTotal
} as Record<string, new (param: unknown) => Permission>

export type ConfigType = Object & {
  [K in keyof typeof REGISTRY]?: ConstructorParameters<(typeof REGISTRY)[K]>[0]
}

export const getConfigEntries = Object.entries as <Type>(
  o: Type
) => {[K in keyof Type]-?: [K, Type[K]]}[keyof Type][]
