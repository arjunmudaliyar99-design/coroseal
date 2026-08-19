import { spawn } from 'node:child_process'

const processes = [
  spawn(process.execPath, ['server/gemini.mjs'], { stdio: 'inherit' }),
  spawn('npx', ['vite'], { stdio: 'inherit', shell: true }),
]

function stop() {
  for (const child of processes) child.kill()
  process.exit()
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
for (const child of processes) child.on('exit', (code) => { if (code && code !== 130) stop() })