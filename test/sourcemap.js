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
  } = await cli([
      'test/fixtures/a.css', 'test/fixtures/b.css', '-m', '-o', output
    ]);

  t.ifError(error, stderr);
  t.is(
    await read(output),
    await read('test/fixtures/ab-map.css')
  );
  t.regex(await read(output), /\/*# sourceMappingURL=output.css.map/);
});

test('--map generate an external map', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli([
      'test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-m', '-o', output
    ]);

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
  } = await cli([
      'test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-m', '-e', '-o', output
    ]);

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

test('--map generate an external map and include existing maps', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli([
      'test/fixtures/a-map.css', 'test/fixtures/b-map.css', '-b', '-m', '-o', output
    ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  t.is(
    '../../a-map.css',
    JSON.parse(await read(output.replace('.css', '.css.map'))).sources[0]
  );
  t.is(
    '../../b-map.css',
    JSON.parse(await read(output.replace('.css', '.css.map'))).sources[1]
  );
});

test('--map generate an external map and preserve embeded code', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli([
      'test/fixtures/a-map-embed.css', 'test/fixtures/b-map-embed.css', '-b', '-m', '-o', output
    ]);

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

test('--map generate an external map and embeded code from original map', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli([
      'test/fixtures/a-map-embed.css', 'test/fixtures/b-map-embed.css', '-b', '-m', '-e', '-o', output
    ]);

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

test('--map generate an external map and add embeded code', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr
  } = await cli([
      'test/fixtures/a-map.css', 'test/fixtures/b-map.css', '-b', '-m', '-e', '-o', output
    ]);

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

test('--map generate an external map even if a source file is refencing a non-existant map', async(t) => {
  const output = tmp('output.css');
  const {
    error,
    stderr,
    stdout
  } = await cli([
      'test/fixtures/a-missing-map.css', 'test/fixtures/b-map.css', '-m', '-o', output
    ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  t.is(
    await read(output),
    await read('test/fixtures/ab-map.css')
  );
  t.is(
    '../../a-missing-map.css',
    JSON.parse(await read(output.replace('.css', '.css.map'))).sources[0]
  );
  t.is(
    '../../b-map.css',
    JSON.parse(await read(output.replace('.css', '.css.map'))).sources[1]
  );
  /* eslint-disable max-len */
  t.regex(stdout,
    /The sourcemap test\/fixtures\/a-missing-map.css.map referenced in test\/fixtures\/a-missing-map.css cannot be read and will be ignored/
  );
});
