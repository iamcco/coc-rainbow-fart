import fs from 'fs';
import globFunc from 'glob';

export const readFile = async (path: string): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, (err, buf) => {
      if (err) {
        return reject(err);
      }
      resolve(buf);
    });
  });
};

export const exists = async (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.exists(path, exists => {
      resolve(exists);
    });
  });
};

export const mkdirs = async (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.mkdir(path, { recursive: true }, err => {
      if (err) {
        return resolve(false);
      }
      resolve(true);
    });
  });
};

export const glob = async (pattern: string, path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    globFunc(
      pattern,
      {
        cwd: path,
        absolute: true,
      },
      (err, paths) => {
        if (err) {
          return reject(err);
        }
        resolve(paths);
      },
    );
  });
};
