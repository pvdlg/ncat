#!/usr/bin/env node

require('../lib')()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(`\n  ${error.message}`);
		process.exit(1);
	});
