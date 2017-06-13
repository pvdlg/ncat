import test from 'ava';
import chmod from 'chmod';
import fs from 'fs-extra';
import tmp from './helpers/tmp';
import cli from './helpers/cli';

test('one file and no banner', async(t) => {
  const {
    err,
    code
  } = await cli(['test/fixtures/a.css']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('no file and a banner', async(t) => {
  const {
    err,
    code
  } = await cli(['-b']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('non-existing files', async(t) => {
  const {
    err,
    code
  } = await cli(['test/fixtures/non-existing.css', 'test/fixtures/a.css']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /Require at least 2 file, banner or footer to concatenate/);
});

test('Unredeable file', async(t) => {
  const output = tmp('unreadeable.css');

  fs.outputFileSync(output, 'empty', {encoding: 'utf8'});
  chmod(output, {read: false});
  const {
    err,
    code
  } = await cli([output, 'test/fixtures/a.css']);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /permission denied/);
});

test('Unwriteable output', async(t) => {
  const output = tmp('unwriteable');

  fs.mkdirpSync(output);
  chmod(output, {write: false});
  const {
    err,
    code
  } = await cli([
      'test/fixtures/a.css', 'test/fixtures/b.css', '-o', `${output}/output.css`
    ]);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /permission denied/);
});

test('Outout as a directory', async(t) => {
  const output = tmp('dir');

  fs.mkdirpSync(output);
  const {
    err,
    code
  } = await cli([
      'test/fixtures/a.css', 'test/fixtures/b.css', '-o', output
    ]);

  t.is(code, 1, 'expected non-zero error code');
  t.regex(err.toString(), /illegal operation on a directory/);
});
