const fs = require('fs');
const path = require('path');

const MAX_SIZE_MB = 10.0;
const WARNING_SIZE_MB = 8.0;

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.vite',
  'coverage',
  '.nyc_output',
  '.vscode',
  '.idea'
]);

const IGNORE_EXTENSIONS = new Set([
  '.db',
  '.sqlite',
  '.sqlite3',
  '.db-journal',
  '.db-wal',
  '.db-shm',
  '.log',
  '.tsbuildinfo'
]);

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (IGNORE_DIRS.has(item.name)) continue;

    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      getFiles(fullPath, fileList);
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (!IGNORE_EXTENSIONS.has(ext)) {
        try {
          const stats = fs.statSync(fullPath);
          fileList.push({ path: fullPath, size: stats.size });
        } catch {
          // ignore transient stat errors
        }
      }
    }
  }

  return fileList;
}

const rootDir = path.resolve(__dirname, '..');
const files = getFiles(rootDir);

let totalBytes = 0;
files.forEach(f => {
  totalBytes += f.size;
});

const totalKB = (totalBytes / 1024).toFixed(2);
const totalMB = (totalBytes / (1024 * 1024)).toFixed(3);

console.log('==================================================');
console.log('       LabLink Repository Size Verification       ');
console.log('==================================================');
console.log(`Scanned source & config files: ${files.length} files`);
console.log(`Total Source Size: ${totalKB} KB (${totalMB} MB)`);
console.log(`Maximum Allowed Size: ${MAX_SIZE_MB} MB`);
console.log(`Target Safety Limit: ${WARNING_SIZE_MB} MB`);
console.log('--------------------------------------------------');

if (parseFloat(totalMB) > MAX_SIZE_MB) {
  console.error(`❌ FAILED: Repository source size (${totalMB} MB) exceeds maximum allowed limit (${MAX_SIZE_MB} MB)!`);
  process.exit(1);
} else if (parseFloat(totalMB) > WARNING_SIZE_MB) {
  console.warn(`⚠️ WARNING: Repository source size (${totalMB} MB) is close to the limit.`);
  console.log(`✅ PASSED: Within ${MAX_SIZE_MB} MB limit.`);
  process.exit(0);
} else {
  console.log(`✅ PASSED: Repository source size (${totalMB} MB) is well within safety thresholds (< ${WARNING_SIZE_MB} MB).`);
  process.exit(0);
}
