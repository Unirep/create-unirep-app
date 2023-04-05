#!/usr/bin/env node

import prompts from 'prompts'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { pipeline } from 'node:stream'
import fetch from 'node-fetch'
import tar from 'tar'

const questions = [
    {
        type: 'text',
        name: 'projectName',
        message: 'What should we name your application?',
    },
    {
        type: 'text',
        name: 'projectDir',
        message:
            'Where should we put this project? (may be relative or absolute)',
        initial: (prev) => path.join(process.cwd(), prev),
    },
    {
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager?',
        choices: ['yarn', 'npm'],
    },
]
const response = await prompts(questions, {
    onCancel: () => process.exit(0),
})

const { projectName, projectDir, packageManager } = response

console.log('Setting up project...')
const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'unirep'))

const r = await fetch(
    `https://github.com/unirep/create-unirep-app/tarball/main`
)
if (!r.ok) {
    console.error('Github tarball https request was not okay!')
    process.exit(1)
}
const streamPipeline = promisify(pipeline)
await streamPipeline(
    r.body,
    tar.x({
        cwd: tmpdir,
    })
)
const files = await fs.promises.readdir(tmpdir)
if (files.length !== 1) {
    console.error('Expected a single top level directory in the tarball')
    process.exit(1)
}
const [filename] = files
const appPath = path.join(tmpdir, filename)

// now start to customize the app as needed

await fs.promises.rm(path.join(appPath, 'yarn.lock'))
await fs.promises.rm(path.join(appPath, '.circleci'), { recursive: true })
try {
    await fs.promises.rm(path.join(appPath, 'packages/cli'), {
        recursive: true,
    })
} catch (err) {
    if (err.code !== 'ENOENT') throw err
}

const packageData = JSON.parse(
    (await fs.promises.readFile(path.join(appPath, 'package.json'))).toString()
)
Object.assign(packageData, {
    name: projectName,
})
await fs.promises.writeFile(
    path.join(appPath, 'package.json'),
    JSON.stringify(packageData, null, 2)
)

// now move the project to where the user expects and do the initial setup

const targetDir = path.isAbsolute(projectDir)
    ? projectDir
    : path.join(process.cwd(), projectDir)
await fs.promises.rename(appPath, targetDir)

const installCommand = packageManager === 0 ? ['yarn'] : ['npm', ['i']]
const install = spawn(...installCommand, {
    cwd: targetDir,
    stdio: ['inherit', 'inherit', 'inherit'],
})
install.on('error', (err) => {
    console.log(err)
    console.error('Install process failed!')
    process.exit(1)
})
