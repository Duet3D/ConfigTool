const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/LPCConfigurator/' : '/',
	configureWebpack: {
		devServer: {
			contentBase: path.join(__dirname, 'dist')
		},
		plugins: [
			new CopyWebpackPlugin([
				{
					from: 'src/machines',
					to: 'machines'
				},
				{
					from: 'src/templates',
					to: 'templates'
				}
			])
		]
	}
}
