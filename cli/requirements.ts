import { Checkbox, Command, EnumType, prompt, Select } from '../deps.ts'
import {
	printError,
	printInfo,
	printSuccess,
	printWarning,
	shell,
} from '../utils.ts'
import { open } from '../deps.ts'

const tools = [
	{
		name: 'Deno',
		description: 'typescript/javascript toolchain',
		purpose: 'runing task and compiling frontend',
		context: ['frontend', 'ci'],
		cli: 'deno',
	},
	{
		name: 'Rustup',
		description: 'rust toolchain',
		purpose: 'interfacing fpga, redpitaya cpu and frontend',
		context: ['backend'],
		cli: 'rustup',
	},
	{
		name: 'Vivado',
		description: 'FPGA SDK',
		purpose: 'building fpga source code',
		context: ['fpga'],
		cli: 'vivado',
	},
	{
		name: 'VSCode',
		description: 'code editor',
		purpose: 'editing project code',
		context: ['ide', 'optional'],
		cli: 'code',
	},
	{
		name: 'Git',
		description: 'versioning system',
		purpose: 'retriving, publishing and versionning project',
		context: ['ci'],
		cli: 'git',
	},
	{
		name: 'ssh',
		description: 'remote access control',
		purpose: 'accessing to redpitaya board cli',
		context: ['ci'],
		cli: 'ssh',
	},
	{
		name: 'scp',
		description: 'remote file management',
		purpose: 'sending project files to redpitaya',
		context: ['ci'],
		cli: 'scp',
	},
	{
		name: 'ssh-keygen',
		description: 'ssh identity manager',
		purpose: 'automate communication to redpitaya by replacing password',
		context: ['ci'],
		cli: 'ssh-keygen',
	},
] as const

type Tool = typeof tools[number]

async function checkTool({ name, cli }: Tool) {
	printInfo('requirements', `checking for ${name}`, `exec: "${cli} --help"`)

	try {
		if (['ssh', 'scp'].includes(cli)) {
			return new TextDecoder()
				.decode(
					(await new Deno.Command(cli, { args: ['--help'] }).output())
						.stderr,
				)
				.includes(`usage: ${cli}`)
		}
		if (cli === 'ssh-keygen') {
			return (
				(
					await new Deno.Command(
						Deno.build.os === 'windows' ? 'print' : 'cat',
						{ args: ['~/.ssh/id_rsa.pub'] },
					).output()
				).success ||
				new TextDecoder()
					.decode(
						(
							await new Deno.Command(cli, {
								args: ['--help'],
							}).output()
						).stderr,
					)
					.includes(`usage: ${cli}`)
			)
		}
		if (cli === 'code') {
			return (
				await new Deno.Command(shell, {
					args: ['-c', `${cli} -h`],
				}).output()
			).success
		}
		if (cli === 'vivado') {
			return new TextDecoder()
				.decode(
					(
						await new Deno.Command(shell, {
							args: ['-c', `${cli} -h`],
						}).output()
					).stdout,
				)
				.includes('Xilinx')
		}
		return (await new Deno.Command(cli, { args: ['--help'] }).output())
			.success
	} catch {
		return false
	}
}

async function fixTool({ name, cli }: Tool): Promise<boolean> {
	if (cli === 'deno') {
		if (Deno.build.os === 'windows') {
			return (await new Deno.Command('pwsh', {
				args: ['-c', 'irm https://deno.land/install.ps1 | iex'],
			}).output()).success
		}
		if (Deno.build.os === 'linux' || Deno.build.os === 'darwin') {
			return (await new Deno.Command(shell, {
				args: [
					'-c',
					'curl -fsSL https://deno.land/x/install/install.sh | sh',
				],
			}).output()).success
		}
		printError(
			'requirements',
			`unsupported architecture ${Deno.build.target}`,
		)
		return false
	}
	if (cli === 'code') {
		printWarning(
			'requirements',
			`auto install is not supported for ${name}`,
		)
		return (await (await open('https://code.visualstudio.com/download'))
			.status()).success
	}
	if (cli === 'git') {
		if (Deno.build.os === 'windows') {
			try {
				return (await new Deno.Command('winget', {
					args: ['install', 'Git.Git'],
				}).output()).success
			} catch {
				printError(
					'requirements',
					`winget is not disponible or install fails, auto install not possible`,
				)
				return (await (await open('https://git-scm.com/download/win'))
					.status()).success
			}
		}
		if (Deno.build.os === 'linux') {
			await new Deno.Command('apt', { args: ['update'] }).output()
			return (await new Deno.Command('apt', {
				args: ['install', 'git -y'],
			}).output()).success
		}
		if (Deno.build.os === 'darwin') {
			try {
				return (await new Deno.Command('brew', {
					args: ['install', 'git'],
				}).output()).success
			} catch {
				printWarning(
					'requirements',
					`homebrew is not disponible or install fails, auto install not possible`,
				)
				return (await (await open('https://git-scm.com/download/mac'))
					.status()).success
			}
		}
		printError(
			'requirements',
			`unsupported architecture ${Deno.build.target}`,
		)
		return false
	}
	if (cli === 'rustup') {
		if (Deno.build.os === 'windows') {
			try {
				return (await new Deno.Command('winget', {
					args: ['install', 'Rustlang.Rustup'],
				}).output()).success
			} catch {
				printError(
					'requirements',
					`winget is not disponible or install fails, auto install not possible`,
				)
				return (await (await open('https://win.rustup.rs/x86_64'))
					.status()).success
			}
		}
		if (Deno.build.os === 'linux' || Deno.build.os === 'darwin') {
			return (await new Deno.Command(shell, {
				args: [
					'-c',
					`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`,
				],
			}).output()).success
		}
		printError(
			'requirements',
			`unsupported architecture ${Deno.build.target}`,
		)
		return false
	}
	if (cli === 'scp') {
		printError(
			'requirements',
			`installation is not implemented for ${name}`,
		)
		return false
	}
	if (cli === 'ssh') {
		printError(
			'requirements',
			`installation is not implemented for ${name}`,
		)
		return false
	}
	if (cli === 'ssh-keygen') {
		printError(
			'requirements',
			`installation is not implemented for ${name}`,
		)
		return false
	}
	if (cli === 'vivado') {
		printWarning(
			'requirements',
			`auto install is not supported for ${name}`,
		)
		return (await (await open(
			'https://redpitaya-knowledge-base.readthedocs.io/en/latest/learn_fpga/3_vivado_env/tutorfpga1.html',
		)).status()).success
	}
	return false
}

const ToolName = new EnumType<Lowercase<Tool['name']>>(
	tools.map(({ name }) => name.toLowerCase() as Lowercase<Tool['name']>),
)

/* interactive mode */
if (Deno.args.length === 1 && Deno.args[0] === 'requirements') {
	await requirementsPrompt()
}

/* classic cli */
export const requirements = new Command()
	.name('implement')
	.description('build application')
	.type('name', ToolName)
	.option('-x, --fix <tool:name>', 'Install missing tools', { collect: true })
	.option('-c, --check', 'Check missing tools')
	.option('-l, --list', 'List tools')
	.action(requirementsHandler)

async function requirementsHandler(
	{ fix, check, list }: {
		fix?: Lowercase<Tool['name']>[]
		check?: boolean
		list?: boolean
	},
) {
	if (check) {
		for (const tool of tools) {
			if (!(await checkTool(tool))) {
				printError(
					'requirements',
					`${tool.name} is missing (or not in path)`,
					`required for ${tool.purpose}`,
				)
			} else {
				printSuccess(
					'requirements',
					`${tool.name} is disponible`,
					'ok',
				)
			}
		}
		return
	}
	if (list) {
		for (const { name, description, purpose, context } of tools) {
			printInfo(
				'requirements',
				`${name} is ${description} used for ${purpose}`,
				context.join(', '),
			)
		}
		return
	}
	if (fix) {
		for (const tool of tools) {
			if (
				!fix.includes(
					tool.name.toLowerCase() as Lowercase<Tool['name']>,
				)
			) break
			if (!(await checkTool(tool))) {
				if (await fixTool(tool)) {
					printSuccess(
						'requirements',
						`${tool.name} is successfully installed`,
					)
				} else {
					printError(
						'requirements',
						`${tool.name} can't be installed`,
					)
				}
			}
		}
		return
	}
}

export async function requirementsPrompt() {
	const options = [
		'list tools requirements',
		'check tools requirements',
		'fix tools requirements',
		'show help',
	] as const
	const { action } = await prompt([{
		name: 'action',
		message: 'Select an action',
		type: Select,
		options: [...options],
	}])

	switch (action as typeof options[number]) {
		case 'list tools requirements':
			await requirementsHandler({ list: true })
			break
		case 'check tools requirements':
			await requirementsHandler({ check: true })
			break
		case 'fix tools requirements':
			{
				const { tool } = await prompt([{
					name: 'tool',
					message:
						'Which tool is missing (press "space" to select, "enter" to validate)',
					type: Checkbox,
					options: tools.map(({ name, purpose }) => ({
						name: `${name} - ${purpose}`,
						value: name.toLowerCase(),
					})),
				}])
				await requirementsHandler({
					fix: tool as Lowercase<Tool['name']>[],
				})
			}
			break
		case 'show help':
		default:
			requirements.showHelp()
			break
	}
}
