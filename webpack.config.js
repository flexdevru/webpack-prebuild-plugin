const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: {
		main: path.resolve(__dirname, './src/index.ts'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'bundle.js',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
			}
		]
	},
	//devtool: 'inline-source-map',
	performance: {
		hints: false,
		maxEntrypointSize: 5120000,
		maxAssetSize: 5120000
	},
	devServer: {
		historyApiFallback: true,
		static: {
			directory: path.join(__dirname, './dist'),
		},
		open: true,
		compress: true,
		hot: true,
		port: 8080,
	},
	plugins: [
		new CleanWebpackPlugin({
			dry: false,
			verbose: true,
			dangerouslyAllowCleanPatternsOutsideProject: true
		}),
		new webpack.HotModuleReplacementPlugin(),
	]
}