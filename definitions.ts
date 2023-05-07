export type Project = {
	uuid: UUID
	host: `${string}@${string}`
	pitaVersion: semverString
}

export type Info = {
	name: string
	version: semverString
	revision: string
	description: string
}

export const supportedVersions = [/0\.1\.\d/] as const
export type semverString = `${number}.${number}.${number}`
export type UUID = `${string}-${string}-${string}-${string}-${string}`
