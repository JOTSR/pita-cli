import { Command, Input, path, prompt } from '../deps.ts'
import { printError, printInfo, printSuccess } from '../utils.ts'
import { Info, Project, supportedVersions, UUID } from '../definitions.ts'
import { compareVersions } from '../utils.ts'
import env from '../env.json' assert { type: 'json' }

const { template } = env
const repoGit = template.repo.git

/* interactive mode */
await initPrompt()

/* classic cli */
export const init = new Command()
	.name('init')
	.description('init pita template app')
	.option('-t, --template <url:string>', 'Pita template url', {
		default: repoGit,
	})
	.option('-d, --destination <name:file>', 'Project directory', {
		default: Deno.cwd(),
	})
	.option('-i, --description <string>', 'App description', {
		default: 'My app',
	})
	.arguments('<name:string> <host:string>')
	.action(initHandler)

async function initHandler(
	{ destination, template, description }: {
		destination: string
		template: string
		description: string
	},
	name: string,
	host: string,
) {
	printInfo('init', `cloning template ${template} to ${destination}`)
	await new Deno.Command('git', { args: ['clone', template, destination] })
		.spawn().status
	printInfo('init', 'reset git historic')
	for await (const entry of Deno.readDir(path.join(destination, '.git'))) {
		if (entry.name === 'hooks') break
		await Deno.remove(path.join(destination, '.git', entry.name))
	}
	printInfo('init', 'initialize git tracking')
	await new Deno.Command('git', { args: ['ini', '-b', 'main'] }).spawn()
		.status

	const projectPath = path.join(Deno.cwd(), destination, '.pita/project.json')

	printInfo('init', 'updating project config', projectPath)
	const project = JSON.parse(await Deno.readTextFile(projectPath)) as Project
	if (!compareVersions(project.pitaVersion, supportedVersions)) {
		printError(
			'init',
			`template pita version "${project.pitaVersion}" is not supported, supported are ${supportedVersions.toString()}`,
		)
	}

	if (!/\w+@\w+/.test(host)) {
		printError(
			'init',
			'wrong host format, must match "user@hostname"',
			host,
		)
	}
	project.host = host as Project['host']
	project.uuid = crypto.randomUUID() as UUID
	await Deno.writeTextFile(JSON.stringify(project, null, '\t'), projectPath)
	printSuccess(
		'init',
		'project config successfully updated',
		JSON.stringify(project),
	)

	printInfo('init', 'updating app info', projectPath)
	const infoPath = path.join(Deno.cwd(), destination, 'www/info/info.json')
	const info: Info = {
		name,
		description,
		revision: '',
		version: '0.0.0',
	}
	await Deno.writeTextFile(JSON.stringify(info, null, '\t'), infoPath)
	printSuccess(
		'init',
		'app info successfully updated',
		JSON.stringify(project),
	)
	printSuccess('init', 'project successfully initialized')
}
export async function initPrompt() {
	const { name, host, description, destination, template } = await prompt([
		{
			name: 'name',
			message: `What's your app name ?`,
			type: Input,
			minLength: 5,
		},
		{
			name: 'host',
			message: 'Redpitaya ssh login, user@host',
			type: Input,
			minLength: 3,
		},
		{
			name: 'description',
			message: 'App description',
			type: Input,
			default: 'My awesome app',
			minLength: 10,
		},
		{
			name: 'destination',
			message: 'Install directory',
			type: Input,
			default: Deno.cwd(),
			minLength: 1,
		},
		{
			name: 'template',
			message: 'Pita template location',
			type: Input,
			default: repoGit,
			minLength: 5,
		},
	])

	if (
		description === undefined || destination === undefined ||
		template === undefined || name === undefined || host === undefined
	) {
		printError(
			'init',
			'some arguments are missing',
			JSON.stringify({ description, destination, template, name, host }),
		)
		return
	}
	await initHandler({ destination, template, description }, name, host)
}
