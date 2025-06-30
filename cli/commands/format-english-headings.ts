import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import title from 'title';

const directoryPath = 'src/data/tools/en';

export async function formatEnglishHeadingsCommand() {
  console.log('Starting to process .mdx files...');

  try {
    const files = await fsp.readdir(directoryPath);

    await Promise.all(
      files.map(async (file) => {
        if (path.extname(file).toLowerCase() === '.mdx') {
          await capitalizeHeadingsInFile(path.join(directoryPath, file));
        }
      }),
    );

    console.log('Script finished. All .mdx file headings have been capitalized.');
  } catch (error) {
    console.error('Error reading the directory:', error);
  }

  process.exit(0);
}

async function capitalizeHeadingsInFile(filePath: string) {
  try {
    const fileContent = await fsp.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    const updatedLines = lines.map((line) => {
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const match = line.match(/^(#+\s+)(.*)$/);

      if (match) {
        const prefix = match[1];
        const headingText = match[2];

        if (!headingText || headingText.trim() === '') {
          return line;
        }

        const capitalizedHeading = title(headingText, {
          special: ['KPI', 'KPIs'],
        });

        return prefix + capitalizedHeading;
      }

      return line;
    });

    const updatedContent = updatedLines.join('\n');

    await fsp.writeFile(filePath, updatedContent, 'utf-8');
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
