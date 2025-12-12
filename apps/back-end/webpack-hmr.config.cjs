const nodeExternals = require("webpack-node-externals");
const { RunScriptWebpackPlugin } = require("run-script-webpack-plugin");
const ExternalPluginsPlugin = require("./webpack-plugins/external-plugins.cjs");

module.exports = (options, webpack) => ({
  ...options,
  entry: ["webpack/hot/poll?100", options.entry],
  infrastructureLogging: {
    level: "warn",
  },
  externals: [
    nodeExternals({
      allowlist: ["webpack/hot/poll?100", /^@common\//, /^@frogstep\/.*$/],
    }),
  ],
  plugins: [
    ...options.plugins,
    new ExternalPluginsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.WatchIgnorePlugin({
      paths: [/\.js$/, /\.d\.ts$/],
    }),
    new RunScriptWebpackPlugin({
      name: options.output.filename,
      autoRestart: false,
    }),
  ],
});
