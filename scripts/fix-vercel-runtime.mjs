import fs from 'node:fs';
import path from 'node:path';

const functionsDir = path.resolve('.vercel/output/functions');
if (fs.existsSync(functionsDir)) {
  function updateConfigs(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        updateConfigs(fullPath);
      } else if (entry.name === '.vc-config.json') {
        try {
          const config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          config.runtime = 'nodejs24.x';
          fs.writeFileSync(fullPath, JSON.stringify(config, null, 2));
          console.log(`[fix-vercel-runtime] Set runtime to nodejs24.x in ${entry.name}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  updateConfigs(functionsDir);
}
