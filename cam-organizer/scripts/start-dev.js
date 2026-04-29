const { spawn, execSync } = require('child_process')
const net = require('net')
const path = require('path')

// node_modules에 설치된 electron 바이너리 경로
const electronBin = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron.exe')

const PORT = 4877

// 포트를 점유 중인 프로세스 종료
function killPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' })
    const pids = [...new Set(
      out.split('\n')
        .map((l) => l.trim().split(/\s+/).pop())
        .filter((p) => p && /^\d+$/.test(p) && p !== '0')
    )]
    pids.forEach((pid) => {
      try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }) } catch {}
    })
    if (pids.length) console.log(`[start-dev] 포트 ${port} 점유 프로세스 종료 (PID: ${pids.join(', ')})`)
  } catch {}
}

function waitForPort(port, retries = 40) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const check = () => {
      const sock = net.createConnection(port, 'localhost')
      sock.on('connect', () => { sock.destroy(); resolve() })
      sock.on('error', () => {
        if (++attempts >= retries) { reject(new Error(`Port ${port} not ready after ${retries} attempts`)); return }
        setTimeout(check, 500)
      })
    }
    setTimeout(check, 500) // 첫 시도 전 약간 대기
  })
}

killPort(PORT)

setTimeout(() => {
  const vite = spawn('npx vite', [], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
    cwd: process.cwd(),
  })

  vite.on('error', (e) => { console.error('Vite error:', e.message); process.exit(1) })

  waitForPort(PORT)
    .then(() => {
      console.log(`[start-dev] Vite 준비됨 → Electron 실행`)
      const electron = spawn(electronBin, ['.'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' },
        cwd: process.cwd(),
      })
      electron.on('error', (e) => console.error('Electron error:', e.message))
      electron.on('close', (code) => {
        vite.kill()
        process.exit(code ?? 0)
      })
    })
    .catch((e) => { console.error(e.message); vite.kill(); process.exit(1) })

  process.on('SIGINT', () => { vite.kill(); process.exit(0) })
}, 500)
