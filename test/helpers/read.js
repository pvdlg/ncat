import {readFile} from 'fs-extra';
import eol from './eol';

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param {String} path file path.
 * @return {String} the content of the file.
 */
export default async function read(path) {
	return eol(await readFile(path, 'utf8'));
}
