import { createWriteStream, chmod } from 'fs';
import tunnel from 'tunnel';
import got from 'got';
import { workspace } from 'coc.nvim';
import { Agent } from 'http';
import jszip from 'jszip';
import { Writable } from 'stream';

export default class HunkStream extends Writable {
  data: any[] = [];

  constructor() {
    super();
  }

  _write(chunk: any, enc: string, callback) {
    this.data.push(chunk);
    process.nextTick(callback);
  }

  toBuffer() {
    return Buffer.concat(this.data);
  }
}

function getAgent(): Agent | undefined {
  const proxy = workspace.getConfiguration('http').get<string>('proxy', '');
  if (proxy) {
    const auth = proxy.includes('@') ? proxy.split('@', 2)[0] : '';
    const parts = auth.length ? proxy.slice(auth.length + 1).split(':') : proxy.split(':');
    if (parts.length > 1) {
      const agent = tunnel.httpsOverHttp({
        proxy: {
          headers: {},
          host: parts[0],
          port: parseInt(parts[1], 10),
          proxyAuth: auth,
        },
      });
      return agent;
    }
  }
}

export async function download(dest: string, url: string, name: string): Promise<void> {
  const statusItem = workspace.createStatusBarItem(0, { progress: true });
  statusItem.text = `Downloading ${name}...`;
  statusItem.show();

  const agent = getAgent();

  return new Promise((resolve, reject) => {
    try {
      const writeSteam = new HunkStream();

      got
        .stream(url, { agent })
        .on('downloadProgress', (progress: any) => {
          const p = (progress.percent * 100).toFixed(0);
          statusItem.text = `${p}% Downloading ${name}`;
        })
        .pipe(writeSteam)
        .on('finish', () => {
          statusItem.hide();
          jszip
            .loadAsync(writeSteam.toBuffer())
            .then(zip => {
              const ffplay = zip.file(name);
              if (ffplay) {
                ffplay
                  .nodeStream()
                  .pipe(createWriteStream(dest))
                  .on('finish', () => {
                    chmod(dest, 0o755, err => {
                      if (err) {
                        return reject(`chmod error ${err}`);
                      }
                      resolve();
                    });
                  });
              }
            })
            .catch(err => {
              reject(`jszip error ${err}`);
            });
        })
        .on('error', e => {
          reject(`steam error ${e}`);
        });
    } catch (e) {
      reject(`unknow error ${e}`);
    }
  });
}
