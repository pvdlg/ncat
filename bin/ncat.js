#!/usr/bin/env node

require('..')()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(`\n  ${error.message}`);
		process.exit(1);
	});
