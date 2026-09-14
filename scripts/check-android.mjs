import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const checks = [
  ['node_modules', existsSync('node_modules')],
  ['android project', existsSync('android')],
  ['.env', existsSync('.env')],
];
for (const [name, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${name}`);
try { execSync('java -version', { stdio: 'inherit', shell: true }); } catch { console.log('✗ Java/JDK not found'); }
try { execSync('adb version', { stdio: 'inherit', shell: true }); } catch { console.log('! ADB not found (install Android SDK platform-tools)'); }
