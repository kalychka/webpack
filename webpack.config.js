const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimazeCssAssetPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const fs = require('fs');

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

const PATHS = {
	src: path.resolve(__dirname, "src"),
	dist: path.resolve(__dirname, "dist")
}

const PAGES_DIR = `${PATHS.src}/pages`
const PAGES = fs.readdirSync(PAGES_DIR).filter(filename => filename.endsWith('.pug'))

const filename = (name, ext) => isDev ? `${name}.${ext}` : `${name}.[hash].${ext}`

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
	entry: {
		index: './index.js',
		about: './about.js'
	},
	output: {
		filename: filename('[name]', 'js'),
		path: path.resolve(__dirname, 'dist')
	},
	optimization: optimization(),
	devServer: {
		port: 4200,
		hot: isDev,
	},
	plugins: [
		...PAGES.map((page) => new HTMLWebpackPlugin({
			template: `${PAGES_DIR}/${page}`,
			filename: filename(`${page.replace(/\.pug/, '')}`, 'html'),
			chunks: '[name]',
			minify: {
				collapseWhitespace: false
			}
		  })),
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
				use: [{
					loader: 'raw-loader',
				}, 
				{
					loader: 'pug-plain-loader',
					options: {
						hmr: isDev,
						reloadAll:true,
						pretty: true,
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