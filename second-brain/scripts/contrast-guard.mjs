import fs from 'fs';
import path from 'path';

const root = process.cwd();
const appDir = path.join(root, 'app');

const riskyTextClasses = [
  'text-slate-200',
  'text-slate-300',
  'text-slate-400',
  'text-white',
];

const includeExt = new Set(['.tsx', '.ts', '.jsx', '.js']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && includeExt.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const violations = [];

  lines.forEach((line, idx) => {
    if (!line.includes('pixel-card-light')) return;
    const hasRisky = riskyTextClasses.some((c) => line.includes(c));
    if (hasRisky) {
      violations.push({
        line: idx + 1,
        text: line.trim(),
      });
    }
  });

  return violations;
}

if (!fs.existsSync(appDir)) {
  console.error('[contrast-guard] app directory not found:', appDir);
  process.exit(1);
}

const files = walk(appDir);
const allViolations = [];

for (const file of files) {
  const violations = checkFile(file);
  for (const v of violations) {
    allViolations.push({ file, ...v });
  }
}

if (allViolations.length > 0) {
  console.error('\n[contrast-guard] Found risky text classes on pixel-card-light elements:\n');
  for (const v of allViolations) {
    console.error(`- ${path.relative(root, v.file)}:${v.line}`);
    console.error(`  ${v.text}`);
  }
  console.error('\nUse darker text classes on light cards (e.g. text-zinc-800 / text-zinc-900).\n');
  process.exit(1);
}

console.log('[contrast-guard] OK');
