import test from 'ava';
import fs from 'fs-extra';
import tempy from 'tempy';
import cli from './helpers/cli';
import read from './helpers/read';

const {pkg} = require('read-pkg-up').sync();

test('--banner works with default banner', async t => {
  const output = tempy.file({extension: 'css'});
  const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-o', output]);

  t.ifError(error, stderr);
  t.is(
    await read(output),
    (await read('test/fixtures/expected/ab-header.css'))
      .replace('<% year %>', new Date().getFullYear())
      .replace('<% version %>', pkg.version)
  );
});

test('--banner works with custom banner', async t => {
  const output = tempy.file({extension: 'css'});
  const {error, stderr} = await cli([
    'test/fixtures/a.css',
    'test/fixtures/b.css',
    '-b',
    'test/fixtures/banner.js',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.is(
    await read(output),
    (await read('test/fixtures/expected/ab-header.css'))
      .replace('<% year %>', new Date().getFullYear())
      .replace('<% version %>', pkg.version)
  );
});

test('--banner works with one file', async t => {
  const {code} = await cli(['test/fixtures/a.css', '-b']);

  t.is(code, 0, 'expected zero return code');
});

test('--banner works with empty package.json', async t => {
  const {error, stderr, stdout} = await cli(
    ['-', '-b'],
    fs.createReadStream('test/fixtures/b.css'),
    'test/fixtures/empty-package'
  );

  t.ifError(error, stderr);
  t.is(
    stdout,
    (await read('test/fixtures/expected/a-empty-header.css')).replace('<% year %>', new Date().getFullYear())
  );
});

test('--banner works with package.json with only name', async t => {
  const {error, stderr, stdout} = await cli(
    ['-', '-b'],
    fs.createReadStream('test/fixtures/b.css'),
    'test/fixtures/package-with-name'
  );

  t.ifError(error, stderr);
  t.is(
    stdout,
    (await read('test/fixtures/expected/a-package-name-only.css')).replace('<% year %>', new Date().getFullYear())
  );
});
