const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimazeCssAssetPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
	const config = {

		/*splitChunks: {
			chunks: 'all'
			}
		*/
		}
		
	if (isProd) {
		config.minimizer = [
			new OptimazeCssAssetPlugin(),
			new TerserWebpackPlugin(),
		]
	}
	return config
}

const PATHS = {
	src: path.resolve(__dirname, "src"),
	dist: path.resolve(__dirname, "dist")
}

const filename = (name, ext) => isDev ? `${name}.${ext}` : `${name}.[hash].${ext}`

const CssLoaders = (extra) => {
	const loaders = [{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: isDev,
				reloadAll:true
			},
		}, 'css-loader'
	]
	if (extra) {
		loaders.push(extra)
	}

	return loaders
}

console.log('is dev: ', isDev)

module.exports = {

	context: path.resolve(__dirname, 'src'),

	entry: {
		index: './entry/index.js',
		uikit: './entry/ui-kit.js',
		uikit2: './entry/ui-kit2.js'
	},

	output: {
		filename: filename('[name]', 'js'),
		path: path.resolve(__dirname, 'dist')
	},

	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@components': path.resolve(__dirname, 'src/components'),
			images: path.resolve(__dirname, 'src/assets/img')
		}
	},

	optimization: optimization(),

	devServer: {
		port: 8081,
		hot: isDev,
		index: 'ui-kit2.html',
	},
	
	plugins: [
		new HTMLWebpackPlugin({
			template: './pages/ui-kit.pug',
			filename: filename('ui-kit', 'html'),
			chunks: ['uikit'],
		}),
		new HTMLWebpackPlugin({
			template: './pages/ui-kit2.pug',
			filename: filename('ui-kit2', 'html'),
			chunks: ['uikit2'],
		}),
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: filename('[name]', 'css'),
		}),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery"
		}),
	],

	module:  {
		rules: [
			{
				test: /\.css$/,
				use: CssLoaders()
			},
			{
				test: /\.scss$/,
				use: CssLoaders('sass-loader'),
			},
			{
				test: /\.pug$/,			
				loader: 'pug-loader',
				options: {
					hmr: isDev,
					reloadAll:true,
					pretty: true,
				}
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				loader: 'file-loader', 
				options: {
					name: '[name].[ext]',
					outputPath: 'assets/images/'
				}
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'assets/fonts/'
				}
			}
		]
	},
}

