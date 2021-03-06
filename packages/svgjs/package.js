Package.describe({
  name: 'loredanacirstea:svgjs',
  version: '2.2.5',
  // Brief, one-line summary of the package.
  summary: 'A lightweight library for manipulating and animating SVG: https://github.com/wout/svg.js',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.addFiles('svg.js', 'client');
  api.export('SVG', 'client');
});
