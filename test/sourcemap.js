import test from 'ava';
import fs from 'fs-extra';
import cli from './helpers/cli';
import tmp from './helpers/tmp';
import read from './helpers/read';

test('--map generate an inline map', async(t) => {
  const output = tmp('output.css');

  const {
    error,
    stderr
  } = await cli(
    [
      'test/fixtures/a.css', 'test/fixtures/b.css',
      '-b',
      '-m',
      '-o', output
    ]
  );

  t.ifError(error, stderr);

  t.regex(await read(output), /\/*# sourceMappingURL=/);
});

test('--map generate an external map', async(t) => {
  const output = tmp('output.css');

  const {
    error,
    stderr
  } = await cli(
    [
      'test/fixtures/a.css', 'test/fixtures/b.css',
      '-b',
      '-m',
      '-o', output
    ]
  );

  t.ifError(error, stderr);

  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));

  t.is(
    JSON.parse(await read(output.replace('.css', '.css.map'))).sourcesContent,
    undefined
  );
});

test('--map generate an external map with embed code', async(t) => {
  const output = tmp('output.css');

  const {
    error,
    stderr
  } = await cli(
    [
      'test/fixtures/a.css', 'test/fixtures/b.css',
      '-b',
      '-m',
      '-e',
      '-o', output
    ]
  );

  t.ifError(error, stderr);

  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));

  t.is(
    await read('test/fixtures/a.css'),
    JSON.parse(await read(output.replace('.css', '.css.map'))).sourcesContent[0]
  );
  t.is(
    await read('test/fixtures/b.css'),
    JSON.parse(await read(output.replace('.css', '.css.map'))).sourcesContent[1]
  );
});
