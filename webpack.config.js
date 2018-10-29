const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const _mode = 'production';

const externals = [
	{
		globalName: 'React',
		nodeModule: 'react',
		productionFilePath: '/cjs/react.production.min.js',
		developmentFilePath: '/cjs/react.development.js'
	},
	{
		globalName: 'ReactDOM',
	 	nodeModule: 'react-dom',
		productionFilePath: '/cjs/react-dom.production.min.js',
		developmentFilePath: '/cjs/react-dom.development.js'
	},
	{
		globalName: 'moment',
	 	nodeModule: 'moment',
		productionFilePath:  '/min/moment.min.js',
		developmentFilePath: '/moment.js'
	},
	{
		globalName: 'DatePicker',
	 	nodeModule: 'react-datepicker',
		productionFilePath: '/dist/react-datepicker.min.js',
		developmentFilePath: '/lib/index.js'
	},
];

function buildExternals(){
	let obj = {};
	externals.forEach( ( item )=>{
		obj[ item.nodeModule ] = item.globalName
	});
	// return JSON.stringify( obj );
	return obj;
}

const _externals = buildExternals();

function buildCopyDependencies( mode ) {
	console.log( mode )
	let paths = [];
	externals.forEach(( item )=>{
		let filePath = 'node_modules/' + item.nodeModule;
		if ( mode === 'production' ) {
			filePath += item.productionFilePath;
		}
		else {
			filePath += item.developmentFilePath;
		}

		paths.push( filePath );
	});
	return paths;
}

module.exports = {
	mode: _mode,
	entry: "./src/index.tsx",
	output: {
		filename: '[name].kinlen.js',
		path: __dirname + "/dist"
	},

	// Enable sourcemaps for debugging webpack's output.
	devtool: "source-map",

	resolve: {
	// Add '.ts' and '.tsx' as resolvable extensions.
	extensions: [".ts", ".tsx", ".js", ".json"]
	},

	module: {
		rules: [
			// All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
			{ test: /\.tsx?$/, loader: "ts-loader" },

			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			// { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
		]
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all',
					enforce: true,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
		}
	},
	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	externals: buildExternals(),
	// externals: {"react":"React","react-dom":"ReactDOM","moment":"moment","react-datepicker":"DatePicker"},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new CopyWebpackPlugin( buildCopyDependencies( _mode ) )
	]
};

console.log( module.exports.externals );
