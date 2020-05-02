const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimazeCssAssetPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
			}
		}

	if (isProd) {
		config.minimizer = [
			new OptimazeCssAssetPlugin(),
			new TerserWebpackPlugin(),
		]
	}

	return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const CssLoaders = (extra) => {
	const loaders = [{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: isDev,
				reloadAll:true,
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
	mode: 'development',
	entry: {
		main: './index.js',
	},
	output: {
		filename: filename('js'),
		path: path.resolve(__dirname, 'dist')
	},
	optimization: optimization(),
	devServer: {
		port: 4200,
		hot: isDev,
	},
	plugins: [
		new HTMLWebpackPlugin({
			template: './index.pug',
			minify: {
				collapseWhitespace: isProd,
			}
		}),
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: filename('css'),
		})
	],
	module:  {
		rules: [
			{
				test: /\.css$/,
				use: CssLoaders()
			},
			{
				test: /\.scss$/,
				use: CssLoaders('sass-loader')
			},
			{
				test: /\.pug$/,
				use: [{
					loader: 'raw-loader',
				}, 
				{
					loader: 'pug-plain-loader',
					options: {
						hmr: isDev,
						reloadAll:true,
					}
				}],
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				use: ['file-loader']
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: ['file-loader']
			}
		]
	}
}