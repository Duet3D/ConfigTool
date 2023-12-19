module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/legacy/' : '/',
	chainWebpack: config => {
		config
			.plugin('copy')
			.tap(args => {
				args[0][0].force = true;
				return args;
			});
	}
}
