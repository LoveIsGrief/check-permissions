import github from '@actions/github'
import core from '@actions/core'
import {GitHub} from '@actions/github/lib/utils'

export type OctokitType = InstanceType<typeof GitHub>
export function getOctoKit(): OctokitType {
  return github.getOctokit(core.getInput('token'))
}
