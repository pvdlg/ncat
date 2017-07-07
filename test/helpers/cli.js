import path from 'path';
import {execFile} from 'child_process';

/**
 * @typedef  {Object}        CliOutput
 * @property {Number}        code
 * @property {Error}         err
 * @property {String|Buffer} stdout
 * @property {String|Buffer} stderr
 */

/**
 * Execute the ncat command line.
 *
 * @param    {Array}              args        List of arguments to pass to ncat
 * @param    {stream.Readable}    stdinStream Data to pass to the standard input
 * @param    {String}             cwd         Current working directory of the ncat cli process
 * @return   {Promise<CliOutput>}             A Promise that resolve to an Object with following properties
 */
export default function cli(args, stdinStream, cwd) {
  /* eslint-disable promise/avoid-new */
  return new Promise((resolve) => {
    args.unshift(path.resolve('bin/ncat'));
    const cp = execFile('node', args, {cwd}, (err, stdout, stderr) => {
      resolve({
        code: err && err.code ? err.code : 0,
        err,
        stdout,
        stderr,
      });
    });

    if (stdinStream) {
      stdinStream.pipe(cp.stdin);
    }
  });
}
