<div align="center">
    <img src="./assets/favicon.png" alt="logo" style="width: 150px; height: 150px"/>
    <h1>Pita cli</h1>
    <p>Simpliest way to develop secure and powerful webapp for redpitaya.</p>
</div>

![GitHub all releases](https://img.shields.io/github/downloads/JOTSR/pita-cli/total?style=flat-square)
![GitHub](https://img.shields.io/github/license/JOTSR/pita-cli?style=flat-square)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/JOTSR/pita-cli?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/JOTSR/pita-cli/ci.yml?style=flat-square)

Pita 🫓 is a cli tool to scaffold and manage webapp for
[redpitaya](https://redpitaya.com/). It allows you to code, build and implement
your webapp with a robust and secure environement. It handle all your workflow,
from tooling installation to testing, benching and publishing.

Project are customizable, by default:

- frontend is in typescript/tsx
- backend is in rust
- fpga is in verilog All app is builded in www/ and sended to repitaya board

More info on
[redpitaya webapp doc](https://redpitaya.readthedocs.io/en/latest/developerGuide/software/build/webapp/webApps.html).

## Usage

Classic cli use

```sh
pita --help
```

Step by step interactive use

```sh
pita
```

Classic worflow example:

1. Once and for all

```sh
pita requirements
```

2. Init a new project

```sh
pita init
```

3. Run build project

```sh
pita build
```

4. Send build files to redpitaya board

```sh
pita implement
```

5. Try your app

## Installation

### Install from [Deno](https://deno.land)

If deno not installed, see
[deno installation](https://deno.com/manual/getting_started/installation) or
run.

- Linux and macOs

```sh
curl -fsSL https://deno.land/x/install/install.sh | sh
```

- Windows

```sh
irm https://deno.land/install.ps1 | iex
```

Then reload your shell and run.

```sh
deno install -Afqn pita https://deno.land/x/pita/pita.ts
```

### Standalone install (not support upgrade)

1. Pick an executable from "release"
2. Add pita to your path
3. Start your project

## Contributing

Read [CONTRIBUTING](./CONTRIBUTING.md) and start a codespace or clone this
repository.

Folow conventionnal commit, comment your code with JSDoc if exposed, use deno
style coventions.

Link your PR with the corresponding issue if it exists.
