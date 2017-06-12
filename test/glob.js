import test from 'ava';
import read from './helpers/read';
import cli from './helpers/cli';

test('accept a glob for files parameters', async(t) => {
  const {
    error,
    stderr,
    stdout
  } = await cli(
    [
      'test/fixtures/{a,b}.css'
    ]
  );

  t.ifError(error, stderr);

  t.is(
    stdout,
    await read('test/fixtures/ab.css')
  );
});

test('ignore non matching globs', async(t) => {
  const {
    error,
    stderr,
    stdout
  } = await cli(
    [
      'test/fixtures/{a,b}.css', 'test/fixtures/{x,z}.css'
    ]
  );

  t.ifError(error, stderr);

  t.is(
    stdout,
    await read('test/fixtures/ab.css')
  );
});
