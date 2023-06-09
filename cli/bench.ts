import { Checkbox, Command, prompt } from '../deps.ts'
import { printError, printInfo, printSuccess } from '../utils.ts'

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'bench') {
	await benchPrompt()
}

/* classic cli */
export const bench = new Command()
	.name('bench')
	.description('bench application')
	.option('-f, --front', 'Bench frontend')
	.option('-b, --back', 'Bench backend')
	.option('-g, --fpga', 'Bench fpga')
	.option('-a, --all', 'Bench all', { standalone: true, default: false })
	.action(benchHandler)

export async function benchPrompt() {
	const options = [
		'execute frontend benches',
		'execute backend benches',
		'execute fpga benches',
	] as const

	const { bench } = await prompt([
		{
			name: 'bench',
			message:
				'What do you want to bench ? (press "space" to select, "enter" to validate)',
			type: Checkbox,
			options: [...options],
		},
	])

	benchHandler({
		front: bench?.includes(options[0]),
		back: bench?.includes(options[1]),
		fpga: bench?.includes(options[2]),
	})
}

async function benchHandler(
	{ front, back, fpga, all }: {
		front?: boolean
		back?: boolean
		fpga?: boolean
		all?: boolean
	},
) {
	const modules = [
		front || all ? 'frontend' : false,
		back || all ? 'backend' : false,
		fpga || all ? 'fpga' : false,
	].filter((module) => module)

	printInfo('bench', `start benching ${modules.join(', ')}`)

	const processes = {
		front: new Deno.Command('deno', { args: ['task', 'bench:front'] }),
		back: new Deno.Command('deno', { args: ['task', 'bench:back'] }),
		fpga: new Deno.Command('deno', { args: ['task', 'bench:fpga'] }),
	}

	const benchs = await Promise.allSettled([
		front || all ? processes.front.spawn().status : { success: true },
		back || all ? processes.back.spawn().status : { success: true },
		fpga || all ? processes.fpga.spawn().status : { success: true },
	])

	const names = ['frontend', 'backend', 'fpga']
	for (const bench of benchs) {
		if (bench.status === 'fulfilled' && bench.value.success) {
			printSuccess('bench', `${names.shift()} benched`)
		} else {
			printError(
				'bench',
				`can't bench ${names.shift()}`,
				'maybe .pita/tasks/bench.ts is missing',
			)
		}
	}
}
