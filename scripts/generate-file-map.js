/**
 * scripts/generate-file-map.js
 * Scans the project directory and generates a clean, safe, plain-English FILE_MAP.json.
 * Sensitive directories (.env, secrets, node_modules, .next, backups) are strictly excluded.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'FILE_MAP.json');

const EXCLUDED = [
  'node_modules',
  '.next',
  '.git',
  '.env',
  '.env.local',
  '.env.production',
  'backup_phase0',
  'data',
  '.vercel',
  '.turbo',
];

const DESCRIPTIONS = {
  'src': 'Source code directory containing all Next.js App Router routes, UI components, and libraries.',
  'src/app': 'Next.js App Router entry points, pages, and REST API endpoints.',
  'src/components': 'Reusable UI components designed with the light-blue airy aesthetic.',
  'src/context': 'React context providers for reactive state across the application.',
  'src/lib': 'Core backend utilities, database drivers, permissions, and mailers.',
  'src/types': 'TypeScript interfaces and type declarations for all domain entities.',
  'db': 'Database schema definitions and SQL migrations.',
  'docs': 'Architectural documentation, operational guides, and setup instructions.',
  'scripts': 'Automation scripts for migration, seeding, and maintenance.',
  'public': 'Static assets, images, icons, and uploaded media.',
};

function buildTree(currentPath, relativePath = '') {
  const name = path.basename(currentPath);
  const isDirectory = fs.statSync(currentPath).isDirectory();

  if (EXCLUDED.includes(name) || name.startsWith('.env')) {
    return null;
  }

  const cleanRel = relativePath ? relativePath.replace(/\\/g, '/') : name;
  const description = DESCRIPTIONS[cleanRel] || `${isDirectory ? 'Folder' : 'File'} in ${cleanRel}`;

  const node = {
    name,
    description,
    type: isDirectory ? 'directory' : 'file',
  };

  if (isDirectory) {
    const children = [];
    const entries = fs.readdirSync(currentPath);

    for (const entry of entries) {
      if (EXCLUDED.includes(entry) || entry.startsWith('.env')) continue;
      const childPath = path.join(currentPath, entry);
      const childRel = relativePath ? `${relativePath}/${entry}` : entry;
      const childNode = buildTree(childPath, childRel);
      if (childNode) children.push(childNode);
    }
    node.children = children;
  }

  return node;
}

function main() {
  console.log('Generating sanitized project file map...');
  const tree = buildTree(ROOT_DIR, '');
  if (tree) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tree, null, 2), 'utf-8');
    console.log(`File map successfully written to ${OUTPUT_FILE}`);
  }
}

main();
