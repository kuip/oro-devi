Package.describe({
  name: 'loredanacirstea:oroboro-controller',
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
    'react',
    'random',
    'reactive-var',
    'loredanacirstea:svgjs'
  ]);
  api.addFiles([
    'svg.easing.min.js',
    'svg.draggy.js',
    'utils.js',
    'oroboro-controller.js'
  ], 'client');
  api.export('OController')
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('loredanacirstea:oroboro-controller');
  api.addFiles('oroboro-controller-tests.js');
});
