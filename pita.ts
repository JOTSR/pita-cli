import { bench, benchPrompt } from './cli/bench.ts'
import { build, buildPrompt } from './cli/build.ts'
import { implement, implementPrompt } from './cli/implement.ts'
import { init, initPrompt } from './cli/init.ts'
import { link, linkPrompt } from './cli/link.ts'
import { mock, mockPrompt } from './cli/mock.ts'
import { requirements, requirementsPrompt } from './cli/requirements.ts'
import { run, runPrompt } from './cli/run.ts'
import { test, testPrompt } from './cli/tests.ts'
import {
	Command,
	DenoLandProvider,
	prompt,
	Select,
	UpgradeCommand,
} from './deps.ts'

if (import.meta.main) {
	const upgradeCommand = new UpgradeCommand({
		main: 'pita.ts',
		args: ['--allow-all'],
		provider: new DenoLandProvider(),
	})

	const main = new Command()
		.name('pita')
		.version('0.2.3')
		.meta('deno', Deno.version.deno)
		.description('🫓 Project manager for RedPitaya web apps 🫓')
		.command('requirements', requirements)
		.command('init', init)
		.command('build', build)
		.command('implement', implement)
		.command('run', run)
		.command('test', test)
		.command('bench', bench)
		.command('mock', mock)
		.command('link', link)
		.command('upgrade', upgradeCommand)
	await main.parse(Deno.args)

	if (Deno.args.length === 0) {
		const options = [
			'check tools requirements',
			'init a new pita 🫓 project',
			'build current project',
			'implement a build into a redpitaya board',
			'run - alias for build then implement',
			'test current project',
			'bench current project',
			'mock redpitaya board to previewing app',
			'passwordless link to current project board',
			'upgrade 🫓 cli',
			'show help',
		] as const

		const { command } = await prompt([{
			name: 'command',
			message: 'Select a command',
			type: Select,
			options: [...options],
		}])

		switch (command as typeof options[number]) {
			case 'check tools requirements':
				await requirementsPrompt()
				break
			case 'init a new pita 🫓 project':
				await initPrompt()
				break
			case 'bench current project':
				await benchPrompt()
				break
			case 'build current project':
				await buildPrompt()
				break
			case 'implement a build into a redpitaya board':
				implementPrompt()
				break
			case 'run - alias for build then implement':
				await runPrompt()
				break
			case 'mock redpitaya board to previewing app':
				await mockPrompt()
				break
			case 'test current project':
				await testPrompt()
				break
			case 'passwordless link to current project board':
				linkPrompt()
				break
			case 'upgrade 🫓 cli':
				await upgradeCommand.parse()
				break
			case 'show help':
			default:
				main.showHelp()
		}
	}
}
