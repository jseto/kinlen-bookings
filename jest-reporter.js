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
		let output = ( results.numFailedTests + results.numRuntimeErrorTestSuites )? fgRed + '✘ ': fgGreen + '✔ ';
		if ( results.numFailedTests ) {
			 output += fgRed + results.numFailedTests + ' failed, ';
		}
		if ( results.numRuntimeErrorTestSuites ) {
			 output += fgRed + results.numRuntimeErrorTestSuites + ' runtime errors, ';
		}
		if ( results.numPendingTests ) {
			 output += fgYellow + results.numPendingTests + ' pending, ';
		}
		if ( results.numPassedTests ) {
			 output += fgGreen + results.numPassedTests + '/' + ( results.numTotalTests + results.numRuntimeErrorTestSuites ) + ' passed. ';
		}
		output += fgWhite + ( results.numTotalTests + results.numRuntimeErrorTestSuites ) + ' total';
		console.log( output,	fgReset );
  }
}

module.exports = MyCustomReporter;
