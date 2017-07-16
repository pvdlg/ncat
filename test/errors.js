import test from 'ava';
import fs from 'fs-extra';
import tmp from './helpers/tmp';
import cli from './helpers/cli';

test('one file and no banner', async t => {
  const {err, code} = await cli(['test/fixtures/a.css']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('no file and a banner', async t => {
  const {err, code} = await cli(['-b']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('non-existing files', async t => {
  const {err, code} = await cli(['test/fixtures/non-existing.css', 'test/fixtures/a.css']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('Outout as a directory', async t => {
  const output = tmp('dir');

  await fs.mkdirp(output);
  const {err, code} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-o', output]);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /illegal operation on a directory/);
});
