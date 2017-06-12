import path from 'path';
import {
  execFile
} from 'child_process';

export default function(args, stdinStream, cwd) {
  return new Promise((resolve) => {
    const cp = execFile(
      path.resolve('bin/ncat'),
      args, {
        cwd
      },
      (err, stdout, stderr) => {
        resolve({
          code: err && err.code ? err.code : 0,
          err,
          stdout,
          stderr
        });
      });

    if (stdinStream) {
      stdinStream.pipe(cp.stdin);
    }
  });
}
