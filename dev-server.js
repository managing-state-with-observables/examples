const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const filenamesWithExtension = fs.readdirSync(path.join(__dirname, 'src'));
const filenames = filenamesWithExtension.map(withExtension => withExtension.slice(0, withExtension.lastIndexOf('.')));

for (const filename of filenames) {
    const compiler = webpack({
        mode: 'development',
        entry: `./src/${filename}.js`,
        output: {
            publicPath: `/${filename}/`
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                    }
                }
            ],
        },
        plugins: [new HtmlWebpackPlugin()],
    })

    app.use(`/${filename}`, middleware(compiler));
}

app.listen(3000);