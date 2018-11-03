let fgRed = "\x1b[31m";
let fgGreen = "\x1b[32m";
let fgYellow = "\x1b[33m";
let fgWhite = "\x1b[37m";
let fgReset = "\x1b[0m";

class MyCustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
		let output = '';
		if ( results.numFailedTests ) {
			 output += fgRed + results.numFailedTests + ' failed, ';
		}
		if ( results.numPendingTests ) {
			 output += fgYellow + results.numPendingTests + ' pending, ';
		}
		if ( results.numPassedTests ) {
			 output += fgGreen + results.numPassedTests + '/' + results.numTotalTests + ' passed. ';
		}
		output += fgWhite + results.numTotalTests + ' total';
		console.log( 	output,	fgReset );
  }
}

module.exports = MyCustomReporter;
