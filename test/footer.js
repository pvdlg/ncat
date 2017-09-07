import test from 'ava';
import tempy from 'tempy';
import cli from './helpers/cli';
import read from './helpers/read';
const {pkg} = require('read-pkg-up').sync();

test('--footer works with custom footer', async t => {
  const output = tempy.file({extension: 'css'});
  const {error, stderr} = await cli([
    'test/fixtures/a.css',
    'test/fixtures/b.css',
    '-f',
    'test/fixtures/footer.js',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.is(
    await read(output),
    (await read('test/fixtures/expected/ab-footer.css'))
      .replace('<% year %>', new Date().getFullYear())
      .replace('<% version %>', pkg.version)
  );
});

test('--footer works with one file', async t => {
  const {code} = await cli(['test/fixtures/a.css', '-f', 'test/fixtures/footer.js']);

  t.is(code, 0, 'expected zero return code');
});

test('--footer works with a banner and a footer', async t => {
  const output = tempy.file({extension: 'css'});
  const {error, stderr} = await cli(['-b', '-f', 'test/fixtures/footer.js', '-o', output]);

  t.ifError(error, stderr);
  t.is(
    await read(output),
    (await read('test/fixtures/expected/banner-footer.css'))
      .replace('<% year %>', new Date().getFullYear())
      .replace('<% version %>', pkg.version)
  );
});
