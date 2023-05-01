import * as core from '@actions/core'
import {REGISTRY} from './permissions'
import {ConfigType, getConfigEntries, readConfigFile} from './utils/config'

async function run(): Promise<void> {
  const configs: ConfigType[] = await readConfigFile(core.getInput('config_file'))
  for (const config of configs) {
    // Only get first element of config
    const configEntries = getConfigEntries(config)
    if (configEntries.length === 0) {
      continue
    }
    const [klassName, configElement] = configEntries[0]
    const permissionClass = REGISTRY[klassName]
    if (permissionClass === undefined) {
      core.setFailed(`Unknown permission class ${klassName}`)
      return
    }

    // Check the permission
    const permission = new permissionClass(configElement)
    const hasPermission = await permission.hasPermission()
    if (!hasPermission) {
      core.setFailed(`${klassName} returned that it has no permission`)
      break
    }
  }
}

run()
