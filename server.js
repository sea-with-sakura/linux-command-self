const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = process.cwd();
const deployDir = path.join(rootDir, '.deploy');
const commandDir = path.join(rootDir, 'command');
const port = Number(process.env.PORT || 3000);
const maxBodySize = 1024 * 1024;
const editToken = process.env.EDIT_TOKEN || '';

let rebuilding = Promise.resolve();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxBodySize) {
        reject(new Error('内容太大，已拒绝保存。'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function commandPathFromRequest(mdPath) {
  const normalized = String(mdPath || '').replace(/\\/g, '/');
  if (!/^\/command\/[^/]+\.md$/.test(normalized)) {
    throw new Error('Markdown 路径不合法。');
  }

  const filename = path.basename(normalized);
  const filePath = path.resolve(commandDir, filename);
  const relative = path.relative(commandDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Markdown 路径越界。');
  }
  return filePath;
}

function commandPathFromName(name) {
  const commandName = String(name || '').trim();
  if (!commandName) {
    throw new Error('请先填写命令名。');
  }
  if (!/^[A-Za-z0-9._+@:-]+$/.test(commandName)) {
    throw new Error('命令名只能包含字母、数字、点、下划线、加号、@、冒号和短横线。');
  }

  const filePath = path.resolve(commandDir, `${commandName}.md`);
  const relative = path.relative(commandDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('命令路径越界。');
  }
  return filePath;
}

function runBuild(markdownPath) {
  rebuilding = rebuilding.then(() => new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const args = ['scripts/build.mjs'];
    if (markdownPath) {
      args.push(`--single=${path.basename(markdownPath, '.md')}`);
    }
    const child = spawn(process.execPath, args, {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(Date.now() - startedAt);
      } else {
        const output = `${stderr}\n${stdout}`.trim();
        reject(new Error(output || `构建失败，退出码 ${code}`));
      }
    });
  }));
  return rebuilding;
}

async function handleSave(req, res) {
  const startedAt = Date.now();
  try {
    if (editToken && req.headers['x-edit-token'] !== editToken) {
      sendJSON(res, 401, {
        ok: false,
        message: '保存令牌不正确。'
      });
      return;
    }

    const body = await readBody(req);
    const data = JSON.parse(body || '{}');
    const content = typeof data.content === 'string' ? data.content : '';
    if (!content.trim()) {
      throw new Error('内容不能为空。');
    }

    const createNew = Boolean(data.create_new);
    const filePath = createNew
      ? commandPathFromName(data.command)
      : commandPathFromRequest(data.md_path);
    if (createNew && fs.existsSync(filePath)) {
      throw new Error('这个命令已经存在，请打开对应页面使用“修正”。');
    }

    await fs.promises.writeFile(filePath, content, 'utf8');
    const writtenAt = Date.now();
    const buildMs = await runBuild(filePath);

    sendJSON(res, 200, {
      ok: true,
      message: '已保存并重新构建。',
      file: path.relative(rootDir, filePath),
      build_mode: 'incremental',
      write_ms: writtenAt - startedAt,
      build_ms: buildMs,
      total_ms: Date.now() - startedAt
    });
  } catch (error) {
    sendJSON(res, 400, {
      ok: false,
      message: error.message || '保存失败。'
    });
  }
}

function staticPathFromURL(url) {
  const parsed = new URL(url, `http://localhost:${port}`);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.resolve(deployDir, `.${pathname}`);
  const relative = path.relative(deployDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }
  return filePath;
}

function serveStatic(req, res) {
  const filePath = staticPathFromURL(req.url);
  if (!filePath) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      sendText(res, 404, 'Not Found');
      return;
    }

    const extname = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/save-md') {
    handleSave(req, res);
    return;
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }
  sendText(res, 405, 'Method Not Allowed');
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Linux Command editor is running at http://localhost:${port}`);
});
