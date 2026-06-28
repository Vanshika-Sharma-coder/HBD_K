import fs from 'fs';
import path from 'path';

// Helper to parse .env file
function loadEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found. Please create it and add GITHUB_TOKEN and GITHUB_USERNAME.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const TOKEN = env.GITHUB_TOKEN;
const USERNAME = env.GITHUB_USERNAME;
const REPO = 'HBD_K';

if (!TOKEN || TOKEN === 'your_personal_access_token_here') {
  console.error('Error: GITHUB_TOKEN is not set in .env or is still the default placeholder.');
  process.exit(1);
}
if (!USERNAME || USERNAME === 'Vanshika-Sharma-coder') {
  console.log(`Using default username: ${USERNAME}`);
}

// Recursively get all files
function getFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

    // Ignore list
    if (
      file === 'node_modules' ||
      file === 'dist' ||
      file === 'dist-ssr' ||
      file === '.git' ||
      file === '.env' ||
      file === '.vscode' ||
      file === 'push-to-github.js' ||
      file === '.DS_Store' ||
      file.endsWith('.log')
    ) {
      return;
    }

    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, baseDir));
    } else {
      results.push({
        absolutePath: filePath,
        relativePath: relativePath
      });
    }
  });
  return results;
}

// GitHub API helper
async function githubRequest(endpoint, options = {}) {
  const url = `https://api.github.com${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'NodeJS-Pusher',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    }
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { raw: text };
  }

  return { status: response.status, data };
}

async function main() {
  console.log('Validating credentials with GitHub...');
  const meRes = await githubRequest('/user');
  if (meRes.status !== 200) {
    console.error(`Authentication failed (Status ${meRes.status}):`, meRes.data);
    process.exit(1);
  }
  console.log(`Authenticated as ${meRes.data.login}`);

  const owner = meRes.data.login;

  console.log(`Checking if repository "${owner}/${REPO}" already exists...`);
  const repoCheck = await githubRequest(`/repos/${owner}/${REPO}`);

  if (repoCheck.status === 404) {
    console.log(`Repository does not exist. Creating "${owner}/${REPO}"...`);
    const createRes = await githubRequest('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: REPO,
        description: 'Happy Birthday K! Web Application',
        private: false,
        auto_init: false
      })
    });

    if (createRes.status !== 201) {
      console.error('Failed to create repository:', createRes.data);
      process.exit(1);
    }
    console.log('Repository created successfully.');
  } else if (repoCheck.status === 200) {
    console.log(`Repository "${owner}/${REPO}" already exists. Proceeding to push files.`);
  } else {
    console.error(`Unexpected response checking repo (Status ${repoCheck.status}):`, repoCheck.data);
    process.exit(1);
  }

  // Get files to upload
  const files = getFiles(process.cwd());
  console.log(`Found ${files.length} files to upload.`);

  // Upload files one by one
  for (const file of files) {
    console.log(`Uploading ${file.relativePath}...`);
    const contentBuffer = fs.readFileSync(file.absolutePath);
    const contentBase64 = contentBuffer.toString('base64');

    // First check if the file exists in the repo to get its SHA if we need to update
    const fileCheck = await githubRequest(`/repos/${owner}/${REPO}/contents/${file.relativePath}?ref=main`);
    let sha = null;
    if (fileCheck.status === 200) {
      sha = fileCheck.data.sha;
    }

    const uploadRes = await githubRequest(`/repos/${owner}/${REPO}/contents/${file.relativePath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Upload ${file.relativePath}`,
        content: contentBase64,
        branch: 'main',
        sha: sha || undefined
      })
    });

    if (uploadRes.status === 200 || uploadRes.status === 201) {
      console.log(`Successfully uploaded ${file.relativePath}`);
    } else {
      console.error(`Failed to upload ${file.relativePath} (Status ${uploadRes.status}):`, uploadRes.data);
      // Stop execution on failure to prevent partial broken uploads
      process.exit(1);
    }
  }

  console.log('\n=============================================');
  console.log('Code successfully pushed to GitHub!');
  console.log(`Repository URL: https://github.com/hbd-k/HBD_K (or your custom URL)`);
  console.log(`Visit your repository at: https://github.com/Vanshika-Sharma-coder/HBD_K`);
  console.log('=============================================');
}

main().catch(err => {
  console.error('Unhandled exception:', err);
  process.exit(1);
});
