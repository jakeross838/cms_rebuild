#!/usr/bin/env node
/**
 * Ross Built Brain Scanner
 * Scans codebase for interactive elements, database operations, syncs, and credentials
 * 
 * Usage: 
 *   node scan.js <project-root>                  # Full scan
 *   node scan.js <project-root> --changed-only   # Only git-changed files
 *   node scan.js <project-root> --credentials    # Also scan for env vars/credentials
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.argv[2] || '.';
const changedOnly = process.argv.includes('--changed-only');
const shouldScanCredentials = process.argv.includes('--credentials');

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.vue', '.svelte'];
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.vercel', 'coverage', '__tests__'];

// ── Element Detection Patterns ──────────────────────────────────────

const ELEMENT_PATTERNS = {
  buttons: {
    patterns: [
      /<button[^>]*>/gi,
      /<Button[^>]*>/gi,
      /onClick\s*[=:{]/gi,
      /onSubmit\s*[=:{]/gi,
      /role\s*=\s*["']button["']/gi,
    ],
    priority: 'high',
  },
  forms: {
    patterns: [
      /<form[^>]*>/gi,
      /<input[^>]*>/gi,
      /<select[^>]*>/gi,
      /<textarea[^>]*>/gi,
      /useForm\s*[\(<]/gi,
      /handleSubmit/gi,
      /useFormik/gi,
      /react-hook-form/gi,
    ],
    priority: 'high',
  },
  toggles: {
    patterns: [
      /<Switch[^>]*>/gi,
      /<Toggle[^>]*>/gi,
      /<Checkbox[^>]*>/gi,
      /type\s*=\s*["']checkbox["']/gi,
    ],
    priority: 'medium',
  },
  navigation: {
    patterns: [
      /<Link[^>]*to\s*=|<Link[^>]*href\s*=/gi,
      /router\.push\s*\(/gi,
      /router\.replace\s*\(/gi,
      /navigate\s*\(/gi,
      /redirect\s*\(/gi,
    ],
    priority: 'medium',
  },
  modals: {
    patterns: [
      /<Dialog[^>]*>/gi,
      /<Modal[^>]*>/gi,
      /<Drawer[^>]*>/gi,
      /<Sheet[^>]*>/gi,
      /<AlertDialog[^>]*>/gi,
    ],
    priority: 'high',
  },
  tables: {
    patterns: [
      /<Table[^>]*>/gi,
      /<DataTable[^>]*>/gi,
      /<DataGrid[^>]*>/gi,
    ],
    priority: 'medium',
  },
  fileUpload: {
    patterns: [
      /<Dropzone/gi,
      /useDropzone/gi,
      /type\s*=\s*["']file["']/gi,
      /<FileUpload/gi,
      /uploadFile|handleUpload/gi,
    ],
    priority: 'high',
  },
  datePickers: {
    patterns: [
      /<DatePicker/gi,
      /<Calendar/gi,
      /type\s*=\s*["']date["']/gi,
      /<TimePicker/gi,
    ],
    priority: 'medium',
  },
};

// ── Database & Sync Patterns ────────────────────────────────────────

const DB_PATTERNS = {
  supabaseRead: /supabase\s*\.from\s*\(\s*["'](\w+)["']\s*\)\s*\.select/g,
  supabaseInsert: /supabase\s*\.from\s*\(\s*["'](\w+)["']\s*\)\s*\.insert/g,
  supabaseUpdate: /supabase\s*\.from\s*\(\s*["'](\w+)["']\s*\)\s*\.update/g,
  supabaseDelete: /supabase\s*\.from\s*\(\s*["'](\w+)["']\s*\)\s*\.delete/g,
  supabaseUpsert: /supabase\s*\.from\s*\(\s*["'](\w+)["']\s*\)\s*\.upsert/g,
  supabaseRpc: /supabase\s*\.rpc\s*\(\s*["'](\w+)["']/g,
  supabaseRealtime: /supabase\s*\.channel|\.on\s*\(\s*["']postgres_changes["']/g,
  supabaseStorage: /supabase\s*\.storage/g,
  supabaseAuth: /supabase\s*\.auth/g,
};

const SYNC_PATTERNS = {
  googleSheets: /sheets|spreadsheet|google.*sheet/gi,
  webhook: /webhook|hookUrl|callbackUrl/gi,
  email: /sendEmail|resend|sendgrid|nodemailer|transactional/gi,
  externalApi: /fetch\s*\(\s*["'`]https?:\/\/(?!localhost)/gi,
};

// ── Conditional Logic Patterns ──────────────────────────────────────

const LOGIC_PATTERNS = {
  conditionalRender: /\{[^}]*&&\s*</g,         // {condition && <Component}
  ternaryRender: /\{[^}]*\?\s*<[^:]*:\s*</g,   // {condition ? <A> : <B>}
  roleCheck: /role\s*===?\s*["'](\w+)["']|isAdmin|isManager|isPM|isClient/g,
  statusCheck: /status\s*===?\s*["'](\w+)["']/g,
  permissionCheck: /canEdit|canDelete|canApprove|hasPermission|isAuthorized/g,
  disabledState: /disabled\s*=\s*\{/g,
};

// ── File Discovery ──────────────────────────────────────────────────

function getFilesToScan() {
  if (changedOnly) {
    try {
      const diff = execSync('git diff --name-only HEAD~1', { cwd: projectRoot, encoding: 'utf8' });
      return diff.trim().split('\n')
        .filter(f => f && EXTENSIONS.some(ext => f.endsWith(ext)))
        .map(f => path.join(projectRoot, f))
        .filter(f => fs.existsSync(f));
    } catch {
      // Fall through to full scan
    }
  }

  const files = [];
  function walk(dir) {
    if (IGNORE_DIRS.some(d => dir.includes(d))) return;
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) files.push(full);
      }
    } catch {}
  }
  walk(projectRoot);
  return files;
}

// ── Route Inference ─────────────────────────────────────────────────

function inferRoute(filePath) {
  const rel = path.relative(projectRoot, filePath);
  // Next.js App Router
  const appMatch = rel.match(/(?:src\/)?app\/(.*?)\/page\.[tj]sx?$/);
  if (appMatch) return '/' + appMatch[1].replace(/\[([^\]]+)\]/g, ':$1');
  // Next.js Pages Router
  const pagesMatch = rel.match(/pages\/(.*?)(?:\/index)?\.[tj]sx?$/);
  if (pagesMatch) return '/' + pagesMatch[1].replace(/\[([^\]]+)\]/g, ':$1');
  return null;
}

// ── Main Scanner ────────────────────────────────────────────────────

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result = {
    file: path.relative(projectRoot, filePath),
    route: inferRoute(filePath),
    lineCount: lines.length,
    elements: {},
    database: { reads: [], writes: [], deletes: [], rpc: [], realtime: false, storage: false, auth: false },
    syncs: [],
    conditionalLogic: { roles: [], statuses: [], permissions: [], conditionalElements: 0 },
    todos: [],
    exports: [],
  };

  // Scan elements
  for (const [category, config] of Object.entries(ELEMENT_PATTERNS)) {
    const matches = [];
    for (const pattern of config.patterns) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(content)) !== null) {
        const lineNum = content.substring(0, m.index).split('\n').length;
        const start = Math.max(0, lineNum - 3);
        const end = Math.min(lines.length - 1, lineNum + 3);
        matches.push({
          match: m[0].substring(0, 100),
          line: lineNum,
          context: lines.slice(start, end + 1).join('\n').substring(0, 300),
        });
      }
    }
    if (matches.length) result.elements[category] = { count: matches.length, priority: config.priority, samples: matches.slice(0, 5) };
  }

  // Scan database operations
  for (const [key, pattern] of Object.entries(DB_PATTERNS)) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(content)) !== null) {
      const table = m[1] || 'unknown';
      if (key.includes('Read')) result.database.reads.push(table);
      else if (key.includes('Insert') || key.includes('Update') || key.includes('Upsert')) result.database.writes.push(table);
      else if (key.includes('Delete')) result.database.deletes.push(table);
      else if (key.includes('Rpc')) result.database.rpc.push(table);
      else if (key.includes('Realtime')) result.database.realtime = true;
      else if (key.includes('Storage')) result.database.storage = true;
      else if (key.includes('Auth')) result.database.auth = true;
    }
  }
  // Deduplicate
  result.database.reads = [...new Set(result.database.reads)];
  result.database.writes = [...new Set(result.database.writes)];
  result.database.deletes = [...new Set(result.database.deletes)];
  result.database.rpc = [...new Set(result.database.rpc)];

  // Scan syncs
  for (const [key, pattern] of Object.entries(SYNC_PATTERNS)) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) result.syncs.push(key);
  }

  // Scan conditional logic
  for (const [key, pattern] of Object.entries(LOGIC_PATTERNS)) {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(content)) !== null) {
      if (key === 'roleCheck' && m[1]) result.conditionalLogic.roles.push(m[1]);
      else if (key === 'statusCheck' && m[1]) result.conditionalLogic.statuses.push(m[1]);
      else if (key === 'permissionCheck') result.conditionalLogic.permissions.push(m[0]);
      else if (key === 'conditionalRender' || key === 'ternaryRender') result.conditionalLogic.conditionalElements++;
    }
  }
  result.conditionalLogic.roles = [...new Set(result.conditionalLogic.roles)];
  result.conditionalLogic.statuses = [...new Set(result.conditionalLogic.statuses)];
  result.conditionalLogic.permissions = [...new Set(result.conditionalLogic.permissions)];

  // Scan TODOs
  lines.forEach((line, i) => {
    if (/TODO|FIXME|HACK|XXX|PLACEHOLDER/i.test(line)) {
      result.todos.push({ line: i + 1, text: line.trim().substring(0, 200) });
    }
  });

  // Scan exports (component names)
  const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g);
  result.exports = [...exportMatches].map(m => m[1]);

  return result;
}

// ── Credential Scanner ──────────────────────────────────────────────

function scanCredentials() {
  const creds = { envFiles: [], variables: {} };
  const envFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];
  
  for (const envFile of envFiles) {
    const fullPath = path.join(projectRoot, envFile);
    if (!fs.existsSync(fullPath)) continue;
    creds.envFiles.push(envFile);
    
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // Mask the value but keep first/last 4 chars for identification
        const masked = value.length > 10 
          ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
          : '[short-value]';
        creds.variables[key] = { masked, length: value.length, file: envFile };
      }
    }
  }

  // Check package.json for dev port
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const devScript = pkg.scripts?.dev || '';
    const portMatch = devScript.match(/-p\s*(\d+)|PORT=(\d+)|port\s*(\d+)/);
    if (portMatch) creds.devPort = portMatch[1] || portMatch[2] || portMatch[3];
    creds.devScript = devScript;
  } catch {}

  return creds;
}

// ── Main ────────────────────────────────────────────────────────────

const files = getFilesToScan();
const results = [];

for (const file of files) {
  const scan = scanFile(file);
  const hasContent = Object.keys(scan.elements).length > 0 
    || scan.database.reads.length > 0 
    || scan.database.writes.length > 0
    || scan.syncs.length > 0
    || scan.todos.length > 0;
  if (hasContent) results.push(scan);
}

const output = {
  scannedAt: new Date().toISOString(),
  projectRoot: path.resolve(projectRoot),
  mode: changedOnly ? 'changed-only' : 'full',
  filesScanned: files.length,
  filesWithElements: results.length,
  summary: {
    totalElements: results.reduce((sum, r) => sum + Object.values(r.elements).reduce((s, e) => s + e.count, 0), 0),
    totalDbTables: [...new Set(results.flatMap(r => [...r.database.reads, ...r.database.writes, ...r.database.deletes]))],
    totalSyncs: [...new Set(results.flatMap(r => r.syncs))],
    totalTodos: results.reduce((sum, r) => sum + r.todos.length, 0),
    allRoles: [...new Set(results.flatMap(r => r.conditionalLogic.roles))],
    allStatuses: [...new Set(results.flatMap(r => r.conditionalLogic.statuses))],
    hasRealtime: results.some(r => r.database.realtime),
    hasStorage: results.some(r => r.database.storage),
    hasAuth: results.some(r => r.database.auth),
  },
  results,
};

if (shouldScanCredentials) {
  output.credentials = scanCredentials();
}

console.log(JSON.stringify(output, null, 2));
