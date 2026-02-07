import fs from "fs";
import path from "path";

/**
 * Config
 */
const projectFolder = "./src";

/**
 * Recursively list all ts/tsx files
 */
function listFiles(dir: string): string[] {
  let results: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(listFiles(fullPath));
    } else if (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Find best match file by base filename
 */
function findBestMatch(target: string, allFiles: string[]): string | null {
  const targetName = path.basename(target);
  return allFiles.find(f => path.basename(f) === targetName) || null;
}

/**
 * Process a single file to fix imports
 */
function fixImports(filePath: string, allFiles: string[]) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    let resolvedPath = path.resolve(path.dirname(filePath), importPath);

    if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + ".ts") && !fs.existsSync(resolvedPath + ".tsx")) {
      const bestMatch = findBestMatch(importPath, allFiles);
      if (bestMatch) {
        const relativePath = "./" + path.relative(path.dirname(filePath), bestMatch).replace(/\\/g, "/").replace(/\.ts(x)?$/, "");
        content = content.replace(importPath, relativePath);
        console.log(`Auto-fixed import in ${filePath}: ${importPath} -> ${relativePath}`);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

/**
 * Run auto-fix
 */
function runAutoFix() {
  const tsFiles = listFiles(projectFolder);
  tsFiles.forEach(file => fixImports(file, tsFiles));
  console.log("All imports checked and corrected where possible.");
}

runAutoFix();