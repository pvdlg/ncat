import {EOL} from 'os';
import path from 'path';
import test from 'ava';
import randomstring from 'randomstring';
import fs from 'fs-extra';
import tempy from 'tempy';
import unixify from 'unixify';
import cli from './helpers/cli';
import read from './helpers/read';

test('--output works', async t => {
	const output = tempy.file({extension: 'css'});
	const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-o', output]);

	t.falsy(error, stderr);
	t.is(await read(output), await read('test/fixtures/expected/ab.css'));
});

test('preserve order with large number of files', async t => {
	const tmp = tempy.directory();
	const outputFile = path.join(tmp, 'output');

	const outputFilePromises = [];
	const filepaths = [];
	const expected = [];

	for (let i = 0; i < 50; i++) {
		const filepath = path.join(tmp, `file-${i}`);
		const content = randomstring.generate();

		filepaths.push(unixify(filepath));
		expected.push(content);
		outputFilePromises.push(fs.outputFile(filepath, content, {encoding: 'utf8'}));
	}

	await Promise.all(outputFilePromises);

	const {error, stderr} = await cli(filepaths.concat(['-o', outputFile]));

	t.falsy(error, stderr);
	t.is(expected.join(EOL), await read(outputFile));
});
