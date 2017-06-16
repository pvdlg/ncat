import {
  readFile
} from 'fs-extra';

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param  {String} path file path
 * @return {String}      the content of the file
 */
export default function read(path) {
  return readFile(path, 'utf8');
}
