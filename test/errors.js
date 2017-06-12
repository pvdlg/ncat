import test from 'ava';
import cli from './helpers/cli';

test('one file and no banner', (t) =>
  cli(
    [
      'test/fixtures/a.css'
    ]
  ).then(({
    err,
    code
  }) => {
    t.is(code, 1, 'expected non-zero error code');
    t.regex(err.toString(), /Require at least 2 files, or 1 file and a banner to concatenate./);
  })
);

test('no file and a banner', (t) =>
  cli(
    [
      '-b'
    ]
  ).then(({
    err,
    code
  }) => {
    t.is(code, 1, 'expected non-zero error code');
    t.regex(err.toString(), /Require at least 2 files, or 1 file and a banner to concatenate./);
  })
);

test('non-existing files', (t) =>
  cli(
    [
      'test/fixtures/non-existing.css', 'test/fixtures/a.css'
    ]
  ).then(({
    err,
    code
  }) => {
    t.is(code, 1, 'expected non-zero error code');
    t.regex(err.toString(), /Require at least 2 files, or 1 file and a banner to concatenate./);
  })
);
