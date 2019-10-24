import path from 'path';
import test from 'ava';
import fs from 'fs-extra';
import tempy from 'tempy';
import tempDir from 'temp-dir';
import unixify from 'unixify';
import cli from './helpers/cli';
import read from './helpers/read';
import eol from './helpers/eol';

test('--map generate an external map (css)', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-m', '-o', output]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	t.regex(await read(output), new RegExp(`/*# source${''}MappingURL=${path.basename(output)}.map`));

	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(sourceMap.file, path.basename(output));
});

test('--map generate an external map (js)', async t => {
	const output = tempy.file({extension: 'js'});
	const {error, stderr} = await cli(['test/fixtures/a.js', 'test/fixtures/b.js', '-m', '-o', output]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.js', '.js.map')));
	t.regex(await read(output), new RegExp(`//# source${''}MappingURL=${path.basename(output)}.map`));

	const sourceMap = JSON.parse(await read(output.replace('.js', '.js.map')));

	t.is(sourceMap.file, path.basename(output));
});

test('--map generate an external map ignoring stdin', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(
		['test/fixtures/a.css', '-', '-m', '-o', output],
		fs.createReadStream('test/fixtures/b.css')
	);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/a.css'))), sourceMap.sources[0]);
	t.is(1, sourceMap.sources.length);
	t.is(sourceMap.file, path.basename(output));
});

test('without --map do not generate an external map', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-o', output]);

	t.falsy(error, stderr);
	t.falsy(await fs.pathExists(output.replace('.css', '.css.map')));
	t.notRegex(await read(output), new RegExp(`/*# source${''}MappingURL=${path.basename(output)}.map`));
});

test('--map generate an external map with non embedded sources', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-m', '-o', output]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(sourceMap.sourcesContent, undefined);
	t.is(sourceMap.file, path.basename(output));
});

test('--map generate an external map with embedded sources', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-b', '-m', '-e', '-o', output]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(await read('test/fixtures/a.css'), sourceMap.sourcesContent[0]);
	t.is(await read('test/fixtures/b.css'), sourceMap.sourcesContent[1]);
});

test('--map generate an external map and include existing maps', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(['test/fixtures/a-map.css', 'test/fixtures/b-map.css', '-b', '-m', '-o', output]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/a-map.css'))), sourceMap.sources[0]);
	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/b-map.css'))), sourceMap.sources[1]);
});

test('--map generate an external map and include existing inlined maps', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli([
		'test/fixtures/a-map-inline.css',
		'test/fixtures/b-map.css',
		'-b',
		'-m',
		'-o',
		output,
	]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/a-map-inline.css'))), sourceMap.sources[0]);
	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/b-map.css'))), sourceMap.sources[1]);
});

test('--map generate an external map and include existing maps from sub-directory', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli([
		'test/fixtures/a-map-subdir.css',
		'test/fixtures/b-map.css',
		'-b',
		'-m',
		'-o',
		output,
	]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/a-map-subdir.css'))), sourceMap.sources[0]);
	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/b-map.css'))), sourceMap.sources[1]);
	t.is(sourceMap.file, path.basename(output));
});

test('--map generate an external map and preserve embeded code', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli([
		'test/fixtures/a-map-embed.css',
		'test/fixtures/b-map-embed.css',
		'-b',
		'-m',
		'-o',
		output,
	]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(await read('test/fixtures/a.css'), eol(sourceMap.sourcesContent[0]));
	t.is(await read('test/fixtures/b.css'), eol(sourceMap.sourcesContent[1]));
});

test("--map generate an external map and do not embed code if it wasn't embeded in original map", async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli([
		'test/fixtures/a-map.css',
		'test/fixtures/b-map.css',
		'-b',
		'-m',
		'-e',
		'-o',
		output,
	]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(undefined, sourceMap.sourcesContent);
});

test('--map generate an external map even if a source file is refencing a non-existant map', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr, stdout} = await cli([
		'test/fixtures/a-missing-map.css',
		'test/fixtures/b-map.css',
		'-m',
		'-o',
		output,
	]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	t.is(
		await read(output),
		(await read('test/fixtures/expected/ab-map.css')).replace('<% file %>', path.basename(output))
	);
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/a-missing-map.css'))), sourceMap.sources[0]);
	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/b-map.css'))), sourceMap.sources[1]);
	t.regex(
		stdout,
		/The sourcemap (.*)a-missing-map.css.map referenced in (.*)a-missing-map.css cannot be read and will be ignored/
	);
});

test('--map generate an external map even if a source file is refencing a non-existant map and use embed option', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr, stdout} = await cli([
		'test/fixtures/a-missing-map.css',
		'test/fixtures/b-map.css',
		'-m',
		'-e',
		'-o',
		output,
	]);

	t.falsy(error, stderr);
	t.truthy(await fs.pathExists(output.replace('.css', '.css.map')));
	t.is(
		await read(output),
		(await read('test/fixtures/expected/ab-map.css')).replace('<% file %>', path.basename(output))
	);
	const sourceMap = JSON.parse(await read(output.replace('.css', '.css.map')));

	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/a-missing-map.css'))), sourceMap.sources[0]);
	t.is(unixify(path.relative(tempDir, path.resolve('test/fixtures/b-map.css'))), sourceMap.sources[1]);
	t.regex(
		stdout,
		/The sourcemap (.*)a-missing-map.css.map referenced in (.*)a-missing-map.css cannot be read and will be ignored/
	);
});
