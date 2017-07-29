import path from 'path';
import execa from 'execa';

/**
 * Execute the ncat command line.
 *
 * @param {Array} args List of arguments to pass to ncat.
 * @param {stream.Readable} input Data to pass to the standard input.
 * @param {String} cwd Current working directory of the ncat cli process.
 * @return {Promise<ChildProcess>} A Promise that resolve to the CLI execution result (as ChildProcess instance).
 */
export default function cli(args, input, cwd) {
  return execa(path.resolve('bin/ncat'), args, {cwd, input, stripEof: false});
}
