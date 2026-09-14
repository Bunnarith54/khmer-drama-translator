import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const run = (cmd) => { console.log(`\\n> ${cmd}`); execSync(cmd, { stdio: 'inherit', shell: true }); };

if (!existsSync('node_modules')) run('npm install');
if (!existsSync('android')) run('npx cap add android');
run('npm run build');
run('npx cap sync android');
console.log('\\nAndroid project is ready. Use: npm run android:build');
