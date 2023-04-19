import * as core from '@actions/core'
import {wait} from './wait'
import {ConfigType, REGISTRY, getConfigEntries} from './permissions'

async function run(): Promise<void> {
  // TODO: Read configuration from core
  const config: ConfigType = {}
  for (const [klassName, configElement] of getConfigEntries(config)) {
    const permissionClass = REGISTRY[klassName]
    if (permissionClass === undefined) {
      core.setFailed(`Unknown permission class ${klassName}`)
      return
    }
    const permission = new permissionClass(configElement)
    await permission.hasPermission()
  }
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
