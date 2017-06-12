import test from 'ava';
import cli from './helpers/cli';

test('--help', async(t) => {
  const {
    code,
    error,
    stderr,
    stdout
  } = await cli(
    [
      '-h'
    ]
  );

  t.ifError(error, stderr);
  t.is(code, 0, 'expected zero return code');
  t.regex(stdout, /Usage:/);
  t.regex(stdout, /Options:/);
  t.regex(stdout, /Examples:/);
});

test('--version', async(t) => {
  const {
    code,
    error,
    stderr,
    stdout
  } = await cli(
    [
      '--version'
    ]
  );

  t.ifError(error, stderr);
  t.is(code, 0, 'expected zero return code');
  t.is(stdout, `${require('./../package').version}\n`);
});
