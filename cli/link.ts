import { Command } from '../deps.ts'
import { printError, printInfo } from '../utils.ts'

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'run') {
	linkPrompt()
}

/* classic cli */
export const link = new Command()
	.name('link')
	.description(
		'copy public ssh key to repitaya board',
	)
	.action(linkHandler)

export function linkPrompt() {
	linkHandler()
}

async function linkHandler() {
	const path = './.pita/project.json'
	printInfo('link', 'get host from .pita/project.json')
	const { host } = await import(path)
		.catch((e) => {
			printError(
				'link',
				`can't get host, maybe file is missing or cli is not used from project root`,
			)
			console.error(e)
			Deno.exit(1)
		})
		.then((project) => project)
	printInfo('link', 'copy key')
	new Deno.Command('scp', {
		args: [
			'scp',
			'~/.ssh/id_rsa.pub',
			`root@${host}:~/.ssh/authorized_keys`,
		],
	}).spawn()
}
