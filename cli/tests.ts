import { Checkbox, Command, prompt } from '../deps.ts'
import { printError, printInfo, printSuccess } from '../utils.ts'

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'test') {
	await testPrompt()
}

/* classic cli */
export const test = new Command()
	.name('test')
	.description('test application')
	.option('-f, --front', 'Test frontend')
	.option('-b, --back', 'Test backend')
	.option('-g, --fpga', 'Test fpga')
	.option('-a, --all', 'Test all', { standalone: true, default: false })
	.action(testHandler)

export async function testPrompt() {
	const options = [
		'execute frontend tests',
		'execute backend tests',
		'execute fpga tests',
	] as const

	const { test } = await prompt([
		{
			name: 'test',
			message:
				'What do you want to test ? (press "space" to select, "enter" to validate)',
			type: Checkbox,
			options: [...options],
		},
	])

	testHandler({
		front: test?.includes(options[0]),
		back: test?.includes(options[1]),
		fpga: test?.includes(options[2]),
	})
}

async function testHandler(
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

	printInfo('test', `start testing ${modules.join(', ')}`)

	const tests = await Promise.allSettled([
		front || all
			? new Deno.Command('deno', { args: ['task', 'test:front'] })
				.output()
			: { success: true },
		back || all
			? new Deno.Command('deno', { args: ['task', 'test:back'] }).output()
			: { success: true },
		fpga || all
			? new Deno.Command('deno', { args: ['task', 'test:fpga'] }).output()
			: { success: true },
	])

	const names = ['frontend', 'backend', 'fpga']
	for (const test of tests) {
		if (test.status === 'fulfilled' && test.value.success) {
			printSuccess('test', `${names.shift()} test executed`)
		} else {
			printError(
				'test',
				`can't test ${names.shift()}`,
				'maybe .pita/tasks/test.ts is missing',
			)
		}
	}
}
