import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.ignored' || file === '.tanstack' || file === '.lovable') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.env.local') || file.endsWith('.toml') || file.endsWith('.sql') || file.endsWith('.js') || file.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('service_role') || content.includes('db_password') || content.includes('POSTGRES_') || content.includes('DATABASE_URL')) {
        console.log(`Found pattern in: ${fullPath}`);
        // Find and print lines containing the pattern
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('service_role') || line.includes('db_password') || line.includes('POSTGRES_') || line.includes('DATABASE_URL')) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir('.');
