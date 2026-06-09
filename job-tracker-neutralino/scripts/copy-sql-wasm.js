import { copyFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const wasmSource = join(root, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
const wasmDestDir = join(root, 'resources', 'js')
const wasmDest = join(wasmDestDir, 'sql-wasm.wasm')

mkdirSync(wasmDestDir, { recursive: true })
copyFileSync(wasmSource, wasmDest)
console.log('Copied sql-wasm.wasm to resources/js/')
