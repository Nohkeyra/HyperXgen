import fs from "fs";
import path from "path";

/**
 * Config: Set project root as folder to scan
 */
const projectFolder = ".";

/**
 * Recursively list all .ts/.tsx files
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
 * Fix import paths in a single file
 */
function fixImports(filePath: string, allFiles: string[]) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolvedPath = path.resolve(path.dirname(filePath), importPath);

    // If file does not exist, attempt auto-correction
    if (
      !fs.existsSync(resolvedPath) &&
      !fs.existsSync(resolvedPath + ".ts") &&
      !fs.existsSync(resolvedPath + ".tsx")
    ) {
      const bestMatch = findBestMatch(importPath, allFiles);
      if (bestMatch) {
        const relativePath =
          "./" +
          path.relative(path.dirname(filePath), bestMatch)
            .replace(/\\/g, "/")
            .replace(/\.ts(x)?$/, "");
        content = content.replace(importPath, relativePath);
        console.log(`Auto-fixed import in ${filePath}: ${importPath} -> ${relativePath}`);
        modified = true;
      } else {
        console.log(`Import not found and no match for ${importPath} in ${filePath}`);
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

/**
 * Run auto-fix: scan all files, fix imports, and optionally call init()
 */
async function runAutoFix() {
  const tsFiles = listFiles(projectFolder);
  console.log("Scanning TypeScript files...\n");

  for (const file of tsFiles) {
    fixImports(file, tsFiles);

    // Optional: dynamically import file and call init() if exported
    try {
      const module = await import(path.resolve(file));
      if (module.init && typeof module.init === "function") {
        module.init();
        console.log(`${file}: init() executed`);
      }
    } catch (err) {
      console.log(`${file}: Import warning - ${(err as Error).message}`);
    }
  }

  console.log("\nAuto-fix complete. All imports checked and corrected where possible.");
}

/**
 * Execute
 */
runAutoFix();