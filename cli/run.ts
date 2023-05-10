import { Checkbox, Command, prompt } from '../deps.ts'
import { printInfo } from '../utils.ts'
import { buildHandler } from './build.ts'
import { implementHandler } from './implement.ts'

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'run') {
	await runPrompt()
}

/* classic cli */
export const run = new Command()
	.name('run')
	.description(
		'run application, alias for "pita build --* && pita implement"',
	)
	.option('-f, --front', 'run frontend')
	.option('-b, --back', 'run backend')
	.option('-g, --fpga', 'run fpga')
	.option('-a, --all', 'run all', { standalone: true, default: true })
	.action(runHandler)

export async function runPrompt() {
	const options = [
		'run frontend',
		'run backend',
		'run fpga',
	] as const

	const { run } = await prompt([
		{
			name: 'run',
			message:
				'What do you want to run ? (press "space" to select, "enter" to validate)',
			type: Checkbox,
			options: [...options],
		},
	])

	runHandler({
		front: run?.includes(options[0]),
		back: run?.includes(options[1]),
		fpga: run?.includes(options[2]),
	})
}

async function runHandler(
	{ front, back, fpga, all }: {
		front?: boolean
		back?: boolean
		fpga?: boolean
		all?: boolean
	},
) {
	printInfo('build', 'build process starts')
	await buildHandler({ front, back, fpga, all })
	await implementHandler()
	printInfo('build', 'build process ends')
}
