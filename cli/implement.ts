import { Command } from '../deps.ts'
import { printError, printInfo, printSuccess } from '../utils.ts'

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'implement') {
	implementPrompt()
}

/* classic cli */
export const implement = new Command()
	.name('implement')
	.description('implement application into redpitaya')
	// .option('-u, --url', 'Repitaya url')
	.action(implementHandler)

export function implementPrompt() {
	implementHandler()
}

export async function implementHandler() {
	printInfo('implement', 'sending build files to board')
	const { success } = await new Deno.Command('deno', {
		args: ['task', 'implement'],
	}).spawn().status
	if (success) {
		printSuccess('implement', 'files correctly implemented to board')
	} else {
		printError(
			'implement',
			`can't send files to board, maybe board in read-only`,
			'try executing "rw" in board shell',
		)
	}
}
