import * as fs from 'fs';
import * as path from 'path';

const updateImports = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Update date-fns imports
  const updatedContent = content.replace(
    /import \{ (.*?) \} from ['"]date-fns['"]/g,
    (match, imports) => {
      const importList = imports.split(',').map(i => i.trim());
      const updatedImports = importList.map(imp => 
        `import { ${imp} } from 'date-fns/${imp.split(' as ')[0]}'`
      ).join('\n');
      return updatedImports;
    }
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated imports in ${filePath}`);
  }
};

const walkDir = (dir: string) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath);
    } else if (
      stat.isFile() && 
      (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))
    ) {
      updateImports(filePath);
    }
  });
};

// Start from src directory
walkDir(path.join(process.cwd(), 'src')); 