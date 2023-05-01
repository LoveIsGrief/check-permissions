import {REGISTRY} from '../permissions'
import {parse} from 'yaml'
import {readFile} from 'node:fs/promises'

export type ConfigType = Object & {
  [K in keyof typeof REGISTRY]?: ConstructorParameters<(typeof REGISTRY)[K]>[0]
}

/**
 * The config is a YAML files
 *
 * TODO ensure the output really is ConfigType
 */
export async function readConfigFile(filePath: string): Promise<ConfigType[]> {
  const contents = await readFile(filePath)
  return parse(contents.toString())
}

export const getConfigEntries = Object.entries as <Type>(
  o: Type
) => {[K in keyof Type]-?: [K, Type[K]]}[keyof Type][]
