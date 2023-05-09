import { Checkbox, Command, prompt } from '../deps.ts'
import { printError, printInfo, printSuccess } from '../utils.ts'
export const build = new Command()
	.name('build')
	.description('build application')
	.option('-f, --front', 'Build frontend')
	.option('-b, --back', 'Build backend')
	.option('-g, --fpga', 'Build fpga')
	.option('-a, --all', 'Build all', { standalone: true, default: true })
	.action(buildHandler)

export async function buildPrompt() {
	const options = [
		'build frontend',
		'build backend',
		'build fpga',
	] as const

	const { build } = await prompt([
		{
			name: 'build',
			message:
				'What do you want to build ? (press "space" to select, "enter" to validate)',
			type: Checkbox,
			options: [...options],
		},
	])

	buildHandler({
		front: build?.includes(options[0]),
		back: build?.includes(options[1]),
		fpga: build?.includes(options[2]),
	})
}

async function buildHandler(
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

	printInfo('build', `start building ${modules.join(', ')}`)

	const builds = await Promise.allSettled([
		front || all
			? new Deno.Command('deno', { args: ['task', 'build:front'] })
				.output()
			: { success: true },
		back || all
			? new Deno.Command('deno', { args: ['task', 'build:back'] })
				.output()
			: { success: true },
		fpga || all
			? new Deno.Command('deno', { args: ['task', 'build:fpga'] })
				.output()
			: { success: true },
	])

	const names = ['frontend', 'backend', 'fpga']
	for (const build of builds) {
		if (build.status === 'fulfilled' && build.value.success) {
			printSuccess('build', `${names.shift()} builded`)
		} else {
			printError(
				'build',
				`can't build ${names.shift()}`,
				'maybe .pita/tasks/build.ts is missing',
			)
		}
	}
}
