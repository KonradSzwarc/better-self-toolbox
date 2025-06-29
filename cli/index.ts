#!/usr/bin/env tsx

import process from 'node:process';
import { program } from 'commander';

import { formatEnglishHeadingsCommand } from './commands/format-english-headings';

program.name('Better Self CLI').description('Better Self Toolbox CLI utilities').version('0.0.1');

program
  .command('format-english-headings')
  .description('Format tool English headings to match The Chicago Manual of Style')
  .action(formatEnglishHeadingsCommand);

program.parse(process.argv);
