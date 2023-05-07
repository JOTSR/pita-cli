import { Checkbox, Command, prompt } from 'cliffy'
import { printError, printInfo, printSuccess } from '../utils.ts'
export const bench = new Command()
	.name('bench')
	.description('bench application')
	.option('-f, --front', 'Bench frontend')
	.option('-b, --back', 'Bench backend')
	.option('-g, --fpga', 'Bench fpga')
	.option('-a, --all', 'Bench all', { standalone: true, default: true })
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

	const benchs = await Promise.allSettled([
		front || all
			? new Deno.Command('deno', { args: ['task', 'bench:front'] })
				.output()
			: { success: true },
		back || all
			? new Deno.Command('deno', { args: ['task', 'bench:back'] })
				.output()
			: { success: true },
		fpga || all
			? new Deno.Command('deno', { args: ['task', 'bench:fpga'] })
				.output()
			: { success: true },
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
