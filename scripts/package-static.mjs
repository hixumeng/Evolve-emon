import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const entries = readdirSync(root);
const pages = entries.filter(name => /\.(html|ico)$/.test(name));
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const name of [...pages, 'LICENSE', 'evolve', 'lib', 'font', 'strings', 'wiki']) {
  cpSync(path.join(root, name), path.join(dist, name), { recursive: true });
}

// Ship the editable sources matching this build, including local modifications.
// Only allowlisted project files enter the archive; no Git data or credentials.
const sourceEntries = [
  ...pages,
  ...entries.filter(name => /^build.*\.js$/.test(name)),
  'src', 'strings', 'lib', 'font', 'scripts', 'LICENSE', 'README.md',
  'DEPLOYMENT.md', 'package.json', 'package-lock.json', 'Dockerfile',
  'compose.yaml', 'deploy', '.dockerignore', '.gitignore'
];
const result = spawnSync('tar', ['-czf', path.join(dist, 'source.tar.gz'), '--', ...sourceEntries], {
  cwd: root, stdio: 'inherit'
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`Source archive failed (exit ${result.status})`);
writeFileSync(path.join(dist, 'source.html'), `<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Evolve-emon 源码</title><body>
<h1>Evolve-emon 源码</h1>
<p>本版本基于 <a href="https://github.com/pmotschmann/Evolve">Evolve</a>，遵循 <a href="LICENSE">MPL-2.0</a>。</p>
<p><a href="source.tar.gz">下载与本次构建对应的可编辑源码</a></p>
<p><a href="https://github.com/hixumeng/Evolve-emon">定制版仓库</a> · <a href="index.html">返回游戏</a></p>
</body></html>\n`);
console.log('Static site and matching source archive written to dist/');
