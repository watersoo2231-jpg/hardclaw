import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface BotProfile {
  id: string
  name: string
  provider: 'anthropic' | 'google' | 'openai' | 'minimax' | 'glm' | 'deepseek' | 'ollama'
  apiKey?: string
  authMethod: 'api-key' | 'oauth'
  telegramBotToken?: string
  botUsername?: string
  modelId?: string
  createdAt: number
}

interface ProfilesData {
  activeId: string | null
  profiles: BotProfile[]
}

const getProfilesPath = (): string => join(app.getPath('userData'), 'bot-profiles.json')

const readProfiles = (): ProfilesData => {
  try {
    const p = getProfilesPath()
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    /* ignore */
  }
  return { activeId: null, profiles: [] }
}

const writeProfiles = (data: ProfilesData): void => {
  writeFileSync(getProfilesPath(), JSON.stringify(data, null, 2))
}

export const listProfiles = (): ProfilesData => readProfiles()

export const saveProfile = (profile: BotProfile): void => {
  const data = readProfiles()
  const idx = data.profiles.findIndex((p) => p.id === profile.id)
  if (idx >= 0) {
    data.profiles[idx] = profile
  } else {
    data.profiles.push(profile)
  }
  data.activeId = profile.id
  writeProfiles(data)
}

export const setActiveProfile = (id: string): void => {
  const data = readProfiles()
  data.activeId = id
  writeProfiles(data)
}

export const deleteProfile = (id: string): void => {
  const data = readProfiles()
  data.profiles = data.profiles.filter((p) => p.id !== id)
  if (data.activeId === id) {
    data.activeId = data.profiles[0]?.id ?? null
  }
  writeProfiles(data)
}
