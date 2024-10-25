'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.addSuppression(`Warning - [sass] The local CSS class '-ms-flex' is not camelCase and will not be type-safe.`);
build.addSuppression(`Warning - [package-solution] Admins can make this solution available to all sites immediately, but the solution also contains feature.xml elements for provisioning. Feature.xml elements are not automatically applied unless the solution is explicitly installed on a site.`);
//build.addSuppression(``);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));
