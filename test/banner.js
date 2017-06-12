import test from 'ava';
import fs from 'fs-extra';
import cli from './helpers/cli';
import tmp from './helpers/tmp';
import read from './helpers/read';

test('--banner works with default banner', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli(
    [
      'test/fixtures/a.css', 'test/fixtures/b.css',
      '-b',
      '-o', output
    ]
  );

  t.ifError(error, stderr);
  t.is(
    await read(output),
    await read('test/fixtures/ab-header.css')
  );
});

test('--banner works with custom banner', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli(
    [
      'test/fixtures/a.css', 'test/fixtures/b.css',
      '-b', 'test/fixtures/banner.js',
      '-o', output
    ]
  );

  t.ifError(error, stderr);
  t.is(
    await read(output),
    await read('test/fixtures/ab-header.css')
  );
});

test('--banner works with one file', async(t) => {
  const {
    code
  } = await cli(
    [
      'test/fixtures/a.css',
      '-b'
    ]
  );

  t.is(code, 0, 'expected zero return code');
});

test('--banner works with empty package.json', async(t) => {
  const {
    error,
    stderr,
    stdout
  } = await cli(
    [
      '-',
      '-b'
    ],
    fs.createReadStream('test/fixtures/b.css'),
    'test/fixtures/empty-package'
  );

  t.ifError(error, stderr);
  t.is(
    stdout,
    await read('test/fixtures/a-empty-header.css')
  );
});

test('--banner works with package.json with only name', async(t) => {
  const {
    error,
    stderr,
    stdout
  } = await cli(
    [
      '-',
      '-b'
    ],
    fs.createReadStream('test/fixtures/b.css'),
    'test/fixtures/package-with-name'
  );

  t.ifError(error, stderr);
  t.is(
    stdout,
    await read('test/fixtures/a-package-name-only.css')
  );
});
