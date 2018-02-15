#!/usr/bin/env node

require('../lib')()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(`\n  ${err.message}`);
		process.exit(1);
	});
