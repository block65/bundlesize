import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { brotliCompress, gzip } from 'node:zlib';
import { glob } from 'glob';

interface FileConfig {
  path: string;
  maxSize: string;
  compression?: 'none' | 'gzip' | 'brotli';
}

export interface Config {
  files: FileConfig[];
}

function humanSizeToBytes(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1000,
    mb: 1000 * 1000,
    gb: 1000 * 1000 * 1000,
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
  const [, value = 0, _whole, _decimal, unit = 'b'] =
    size.toLocaleLowerCase().match(/^((\d+)(\.\d+)?)\s*?(b|kb|mb|gb)?$/) || [];
  const multiplier = units[unit];

  if (!value || !unit || !multiplier) throw new Error(`Invalid size: ${size}`);

  return parseFloat(value) * multiplier;
}

export async function analyseFiles(
  fileConfig: FileConfig,
  options: { workingDirectory?: string } = {},
) {
  const { path, maxSize, compression = 'none' } = fileConfig;
  const filePaths: string[] = await glob(path, {
    ...(options.workingDirectory && { cwd: options.workingDirectory }),
  });
  let totalSize = 0;

  const maxSizeNumber =
    typeof maxSize === 'string' ? humanSizeToBytes(maxSize) : maxSize;

  // eslint-disable-next-line no-restricted-syntax
  for await (const filePath of filePaths) {
    const data = await readFile(filePath);

    let size = 0;

    switch (compression) {
      case 'brotli': {
        const brotliData = await promisify(brotliCompress)(data);
        size = brotliData.byteLength;
        break;
      }

      case 'gzip': {
        const gzipData = await promisify(gzip)(data);
        size = gzipData.byteLength;
        break;
      }

      case 'none':
      default:
        size = data.byteLength;
        break;
    }

    totalSize += size;
  }

  return {
    path,
    compression,
    totalSize,
    maxSizeNumber,
    pass: totalSize <= maxSizeNumber,
  };
}
