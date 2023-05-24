/* eslint-disable no-console */
import Ajv, { type JTDSchemaType } from 'ajv/dist/jtd.js';
import { blue, bold, yellow } from 'colorette';
import { cosmiconfig } from 'cosmiconfig';
import prettyBytes from 'pretty-bytes';
import { analyseFiles, type Config } from '../lib/index.js';
import { dirname } from 'node:path/posix';

// eslint-disable-next-line new-cap
const ajv = new Ajv.default();

const configSchema: JTDSchemaType<Config> = {
  properties: {
    files: {
      elements: {
        properties: {
          path: { type: 'string' },
          maxSize: { type: 'string' },
        },
        optionalProperties: {
          compression: { enum: ['none', 'gzip', 'brotli'] },
        },
      },
    },
  },
};

const configResult = await cosmiconfig('bundlesize').search();

if (!configResult) {
  console.error('❌ No config found.');
  process.exit(1);
}

if (!ajv.validate(configSchema, configResult.config)) {
  console.error(
    `❌ Invalid config: ${ajv.errorsText(ajv.errors, { separator: '\n' })}`,
  );
  process.exit(1);
}

// eslint-disable-next-line no-restricted-syntax
for await (const fileConfig of configResult.config.files) {
  const analysis = await analyseFiles(fileConfig, {
    workingDirectory: dirname(configResult.filepath),
  });

  if (analysis.pass) {
    console.error(
      `✅ Total size ${blue(bold(prettyBytes(analysis.totalSize)))} of ${yellow(
        analysis.path,
      )} <= ${blue(bold(prettyBytes(analysis.maxSizeNumber)))}`,
    );
  } else {
    console.error(
      `❌ Total size (${blue(
        bold(prettyBytes(analysis.totalSize)),
      )}) of ${yellow(analysis.path)} exceeds ${blue(
        bold(prettyBytes(analysis.maxSizeNumber)),
      )}`,
    );
    process.exitCode = 1;
  }
}
