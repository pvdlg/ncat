import path from 'path';
import uuid from 'uuid';

export default function(dir) {
  return path.join('test/fixtures/.tmp', uuid(), dir || '');
}
