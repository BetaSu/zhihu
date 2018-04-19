var path = require('path');
var dist = path.join(__dirname, './dist');
let src = path.join(__dirname, './src')

module.exports = {
	entry : {
		zhihu: src
  },
	output : {
		path: dist,
		filename: 'main.js'
	},
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.jsx', '.ts', '.js', '.es'],
	},
	module : {
		rules : [
			{
				test : /\.(es|js|jsx)$/,
				loader : 'babel-loader',
				query : {
					presets : ['env']
				}
			}
		]
	}
};
