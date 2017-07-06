import test from 'ava';
import fs from 'fs-extra';
import cli from './helpers/cli';
import tmp from './helpers/tmp';
import read from './helpers/read';

test('--map generate an external map (css)', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-m', '-o', output]);

  t.ifError(error, stderr);

  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  t.regex(await read(output), /\/\*# sourceMappingURL=output\.css\.map \*\//);
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is(sourceMap.file, 'output.css');
});

test('--map generate an external map (js)', async(t) => {
  const output = tmp('output.js');
  const {error, stderr} = await cli(['test/fixtures/a.js', 'test/fixtures/b.js', '-m', '-o', output]);

  t.ifError(error, stderr);

  t.truthy(await fs.pathExists(output.replace('.js', '.js.map')));
  t.regex(await read(output), /\/\/# sourceMappingURL=output\.js\.map/);
  const sourceMap = JSON.parse(await read(output.replace('.js', '.js.map')));

  t.is(sourceMap.file, 'output.js');
});

test('--map generate an external map ignoring stdin', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(
    ['test/fixtures/a.css', '-', '-m', '-o', output],
    fs.createReadStream('test/fixtures/b.css')
  );

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is('../../a.css', sourceMap.sources[0]);
  t.is(1, sourceMap.sources.length);
  t.is(sourceMap.file, 'output.css');
});

test('without --map do not generate an external map', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-o', output]);

  t.ifError(error, stderr);
  t.falsy(await fs.pathExists(output.replace('.css', '.css.map')));
  t.notRegex(await read(output), /\/*# sourceMappingURL=output.css.map/);
});

test('--map generate an external map with non embedded sources', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-m', '-o', output]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is(sourceMap.sourcesContent, undefined);
  t.is(sourceMap.file, 'output.css');
});

test('--map generate an external map with embedded sources', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-m', '-e', '-o', output]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is(await read('test/fixtures/a.css'), sourceMap.sourcesContent[0]);
  t.is(await read('test/fixtures/b.css'), sourceMap.sourcesContent[1]);
});

test('--map generate an external map and include existing maps', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(['test/fixtures/a-map.css', 'test/fixtures/b-map.css', '-b', '-m', '-o', output]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is('../../a-map.css', sourceMap.sources[0]);
  t.is('../../b-map.css', sourceMap.sources[1]);
});

test('--map generate an external map and include existing inlined maps', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli([
    'test/fixtures/a-map-inline.css',
    'test/fixtures/b-map.css',
    '-b',
    '-m',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is('../../a-map-inline.css', sourceMap.sources[0]);
  t.is('../../b-map.css', sourceMap.sources[1]);
});

test('--map generate an external map and include existing maps from sub-directory', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli([
    'test/fixtures/a-map-subdir.css',
    'test/fixtures/b-map.css',
    '-b',
    '-m',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is('../../a-map-subdir.css', sourceMap.sources[0]);
  t.is('../../b-map.css', sourceMap.sources[1]);
  t.is(sourceMap.file, 'output.css');
});

test('--map generate an external map and preserve embeded code', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli([
    'test/fixtures/a-map-embed.css',
    'test/fixtures/b-map-embed.css',
    '-b',
    '-m',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is(await read('test/fixtures/a.css'), sourceMap.sourcesContent[0]);
  t.is(await read('test/fixtures/b.css'), sourceMap.sourcesContent[1]);
});

test('--map generate an external map and do not embed code if it wasn\'t embeded in original map', async(t) => {
  const output = tmp('output.css');
  const {error, stderr} = await cli([
    'test/fixtures/a-map.css',
    'test/fixtures/b-map.css',
    '-b',
    '-m',
    '-e',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is(undefined, sourceMap.sourcesContent);
});

test('--map generate an external map even if a source file is refencing a non-existant map', async(t) => {
  const output = tmp('output.css');
  const {error, stderr, stdout} = await cli([
    'test/fixtures/a-missing-map.css',
    'test/fixtures/b-map.css',
    '-m',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  t.is(await read(output), await read('test/fixtures/expected/ab-map.css'));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is('../../a-missing-map.css', sourceMap.sources[0]);
  t.is('../../b-map.css', sourceMap.sources[1]);
  /* eslint-disable max-len */
  t.regex(
    stdout,
    /The sourcemap (.*)a-missing-map.css.map referenced in (.*)a-missing-map.css cannot be read and will be ignored/
  );
});

test('--map generate an external map even if a source file is refencing a non-existant map and use embed option', async(t) => {
  const output = tmp('output.css');
  const {error, stderr, stdout} = await cli([
    'test/fixtures/a-missing-map.css',
    'test/fixtures/b-map.css',
    '-m',
    '-e',
    '-o',
    output,
  ]);

  t.ifError(error, stderr);
  t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
  t.is(await read(output), await read('test/fixtures/expected/ab-map.css'));
  const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

  t.is('../../a-missing-map.css', sourceMap.sources[0]);
  t.is('../../b-map.css', sourceMap.sources[1]);
  /* eslint-disable max-len */
  t.regex(
    stdout,
    /The sourcemap (.*)a-missing-map.css.map referenced in (.*)a-missing-map.css cannot be read and will be ignored/
  );
});
