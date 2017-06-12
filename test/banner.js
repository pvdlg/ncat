import test from 'ava';
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

test('--banner works with one file', (t) =>
  cli(
    [
      'test/fixtures/a.css',
      '-b'
    ]
  ).then(({
    code
  }) => {
    t.is(code, 0, 'expected zero return code');
  })
);
