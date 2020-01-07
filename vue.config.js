module.exports = {
	//baseUrl: process.env.NODE_ENV === 'production' ? '/configtool/' : '/',
	chainWebpack: config => {
		config
			.plugin('copy')
			.tap(args => {
				args[0][0].force = true;
				return args;
			});
	}
}
