import path from 'path';
import uuid from 'uuid';

/**
 * Generate a unique temporary file/directory path.
 *
 * @param {String} filename file/directory name to create under 'test/fixtures/.tmp'.
 * @return {String} the path of the unique temporary file/directory.
 */
export default function tmp(filename) {
  return path.posix.join('test/fixtures/.tmp', uuid(), filename || '');
}
