Package.describe({
  name: 'loredanacirstea:oroboro-menu',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([
    'ecmascript',
    'jquery',
    'reactive-var',
    'loredanacirstea:svgjs',
    'react',
    'random'
  ]);
  api.addFiles([
    'utils.js',
    'menu.js',
  ], 'client');

  api.export('SVGMenu', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('loredanacirstea:oroboro-menu');
  api.addFiles('oroboro-menu-tests.js');
});
