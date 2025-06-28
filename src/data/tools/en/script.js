// add-created-at.js

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Executes a shell command and returns its output.
 * @param {string} command The command to execute.
 * @returns {string} The stdout from the command.
 */
function runCommand(command) {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Processes a single MDX file to add the createdAt date to its frontmatter.
 * @param {string} filePath The absolute path to the MDX file.
 */
function processMdxFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);

  // 1. Get the initial commit date from Git
  const gitDateCmd = `git log --follow --pretty="format:%cI" "${filePath}" | tail -1`;
  const createdAtDate = runCommand(gitDateCmd);

  if (!createdAtDate) {
    console.warn(`  -> Could not determine creation date for ${path.basename(filePath)}. Skipping.`);
    return;
  }

  // 2. Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // 3. Check for valid frontmatter (must be at the start of the file)
  const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    console.warn(`  -> No valid frontmatter found in ${path.basename(filePath)}. Skipping.`);
    return;
  }

  const frontmatterBlock = match[0];
  const frontmatterContent = match[1];

  // 4. Check if 'createdAt' already exists
  if (/^createdAt:/m.test(frontmatterContent)) {
    console.log(`  -> 'createdAt' already exists in ${path.basename(filePath)}. Skipping.`);
    return;
  }

  // 5. Add 'createdAt' to the frontmatter
  const newFrontmatterContent = `${frontmatterContent}\ncreatedAt: '${createdAtDate}'`;
  const newFrontmatterBlock = `---\n${newFrontmatterContent}\n---`;

  // 6. Reconstruct the file and write it back
  const newFileContent = fileContent.replace(frontmatterBlock, `${newFrontmatterBlock}\n`);
  fs.writeFileSync(filePath, newFileContent, 'utf8');

  console.log(`  -> Successfully updated ${path.basename(filePath)} with createdAt: ${createdAtDate}`);
}

/**
 * Main function to find and process all MDX files in the current directory.
 */
function main() {
  const currentDir = process.cwd();
  console.log(`Scanning for .mdx files in ${currentDir}`);

  try {
    const files = fs.readdirSync(currentDir);
    const mdxFiles = files.filter((file) => path.extname(file).toLowerCase() === '.mdx');

    if (mdxFiles.length === 0) {
      console.log('No .mdx files found.');
      return;
    }

    mdxFiles.forEach((file) => {
      const filePath = path.join(currentDir, file);
      processMdxFile(filePath);
    });

    console.log('\nProcessing complete.');
  } catch (error) {
    console.error(`An error occurred while reading the directory: ${error.message}`);
  }
}

// Run the script
main();
