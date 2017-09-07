import test from 'ava';
import fs from 'fs-extra';
import tempy from 'tempy';
import cli from './helpers/cli';
import read from './helpers/read';

test('concatenate stdin', async t => {
  const output = tempy.file({extension: 'css'});
  const {error, stderr} = await cli(
    ['test/fixtures/a.css', '-', '-o', output],
    fs.createReadStream('test/fixtures/b.css')
  );

  t.ifError(error, stderr);
  t.is(await read(output), await read('test/fixtures/expected/ab.css'));
});

test('concatenate stdin multiple times', async t => {
  const output = tempy.file({extension: 'css'});
  const {error, stderr} = await cli(
    ['-', 'test/fixtures/b.css', '-', '-o', output],
    fs.createReadStream('test/fixtures/a.css')
  );

  t.ifError(error, stderr);
  t.is(await read(output), await read('test/fixtures/expected/aba.css'));
});
