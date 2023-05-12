import { Checkbox, Command, prompt } from '../deps.ts'
import { printError, printInfo, printSuccess } from '../utils.ts'

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'mock') {
	await mockPrompt()
}

/* classic cli */
export const mock = new Command()
	.name('mock')
	.description('mock application')
	// .option('-p, --port', 'Frontend serving port')
	// .option('-w, --ws', 'websocket serving port')
	.option('-f, --front', 'mock frontend')
	.option('-b, --back', 'mock backend')
	.option('-g, --fpga', 'mock fpga')
	.option('-a, --all', 'mock all', { standalone: true, default: false })
	.action(mockHandler)

export async function mockPrompt() {
	const options = [
		'mock frontend',
		'mock backend',
		'mock fpga',
	] as const

	const { mock } = await prompt([
		{
			name: 'mock',
			message:
				'What do you want to mock ? (press "space" to select, "enter" to validate)',
			type: Checkbox,
			options: [...options],
		},
	])

	mockHandler({
		front: mock?.includes(options[0]),
		back: mock?.includes(options[1]),
		fpga: mock?.includes(options[2]),
	})
}

async function mockHandler(
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

	printInfo('mock', `start mocking ${modules.join(', ')}`)

	const mocks = await Promise.allSettled([
		front || all
			? new Deno.Command('deno', { args: ['task', 'mock:front'] })
				.output()
			: { success: true },
		back || all
			? new Deno.Command('deno', { args: ['task', 'mock:back'] })
				.output()
			: { success: true },
		fpga || all
			? new Deno.Command('deno', { args: ['task', 'mock:fpga'] })
				.output()
			: { success: true },
	])

	const names = ['frontend', 'backend', 'fpga']
	for (const mock of mocks) {
		if (mock.status === 'fulfilled' && mock.value.success) {
			printSuccess('mock', `${names.shift()} mocked`)
		} else {
			printError(
				'mock',
				`can't mock ${names.shift()}`,
				'maybe .pita/tasks/mock.ts is missing',
			)
		}
	}
}
