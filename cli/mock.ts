import { Command } from 'cliffy'
export const mock = new Command()
	.name('mock')
	.description('mock the application')
	// .option('-p, --port', 'Frontend serving port')
	// .option('-w, --ws', 'websocket serving port')
	.action(() => {
		throw new Error('not implemented')
	})

export async function mockPrompt() {}
