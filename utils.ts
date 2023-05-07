import { semverString } from './definitions.ts'

function print(
	icon: string,
	styles: readonly [string, string, string],
	title: string,
	message: string,
	detail?: string,
) {
	if (detail !== undefined) {
		return console.log(
			`${icon} %c[${title}] %c${message} %c- ${detail}`,
			...styles,
		)
	}
	return console.log(`${icon} %c[${title}] %c${message}`, ...styles)
}

export function printInfo(title: string, message: string, detail?: string) {
	const styles = [
		'color: #3b78ff; font-weight: bold',
		'color: white: font-weigt: normal',
		'color: grey',
	] as const
	print('ℹ️', styles, title, message, detail)
}

export function printError(title: string, message: string, detail?: string) {
	const styles = [
		'color: #f23d4c; font-weight: bold',
		'color: white: font-weigt: normal',
		'color: grey',
	] as const
	print('❌', styles, title, message, detail)
}

export function printSuccess(title: string, message: string, detail?: string) {
	const styles = [
		'color: #16c60c; font-weight: bold',
		'color: white: font-weigt: normal',
		'color: grey',
	] as const
	print('✔️', styles, title, message, detail)
}

export function printWarning(title: string, message: string, detail?: string) {
	const styles = [
		'color: #e87d0d; font-weight: bold',
		'color: white: font-weigt: normal',
		'color: grey',
	] as const
	print('⚠️', styles, title, message, detail)
}

export const shell = Deno.build.os === 'windows'
	? 'pwsh'
	: Deno.build.os === 'darwin'
	? 'zsh'
	: 'bash'

export function compareVersions(
	verion: semverString,
	supported: readonly RegExp[],
): boolean {
	for (const entry of supported) {
		if (verion.match(entry)) {
			return true
		}
	}
	return false
}
