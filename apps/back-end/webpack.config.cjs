const nodeExternals = require("webpack-node-externals");
const ExternalPluginsPlugin = require("./webpack-plugins/external-plugins.cjs");

module.exports = (options) => ({
  ...options,
  externals: [
    nodeExternals({
      allowlist: [/^@common\//, /^@frogstep\/.*$/],
    }),
    // Exclude native modules that can't be bundled
    { argon2: "commonjs argon2" },
  ],
  plugins: [...options.plugins, new ExternalPluginsPlugin()],
});
