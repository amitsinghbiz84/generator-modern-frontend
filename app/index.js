'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var mkdirp = require('mkdirp');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('skip-install', {
      desc: 'Skips the installation of dependencies',
      type: Boolean
    });

  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    this.log(yosay("I've heard you need a flexible project setup, right?"));

    var prompts = [{
      type: 'list',
      name: 'cssPreprocessor',
      message: 'Which CSS preprocessor would you like to use?',
      choices: [{
        name: 'Stylus',
        value: 'stylus',
        checked: true
      }, {
        name: 'SASS',
        value: 'sass'
      }, {
        name: 'SCSS',
        value: 'scss'
      }, {
        name: 'Less',
        value: 'less'
      }, {
        name: 'None (plain css)',
        value: 'none'
      }]
    }, {
      type: 'checkbox',
      name: 'features',
      message: 'UNCHECK the features you WON\'T use:',
      choices: [{
        name: 'Bower',
        checked: true
      }, {
        name: 'CSS Sprites (spritesmith)',
        checked: true
      }, {
        name: 'Image optimization (imagemin)',
        checked: true
      }]
    }];

    this.prompt(prompts, function (props) {
      this.cssPreprocessor = props.cssPreprocessor;
      var cssExtensions = {
        "none": ".css",
        "stylus": ".styl",
        "scss": ".scss",
        "sass": ".sass",
        "less": ".less"
      };
      this.cssExtension = cssExtensions[this.cssPreprocessor];

      this.features = {
        bower: props.features.filter(function(f) { return f.match(/bower/i) }).length > 0,
        spritesmith: props.features.filter(function(f) { return f.match(/spritesmith/i) }).length > 0,
        imagemin: props.features.filter(function(f) { return f.match(/imagemin/i) }).length > 0,
      }

      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      mkdirp.sync('app');
      mkdirp.sync('app/js');
      mkdirp.sync('app/css');
      mkdirp.sync('app/images');
      mkdirp.sync('app/fonts');
      this.copy('main.js', 'app/js/main.js');

      this.fs.copy(
        this.templatePath('_babelrc'),
        this.destinationPath('.babelrc')
      );

      this.template('index.html', 'app/index.html');

      this.fs.copy(
        this.templatePath('main' + this.cssExtension),
        this.destinationPath('app/css/main' + this.cssExtension)
      );

      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('favicon.ico')
      );

      // copy bower files only if requested
      if (this.features.bower) {
        this.fs.copy(
          this.templatePath('_bower.json'),
          this.destinationPath('bower.json')
        );
      }

      if (this.features.spritesmith) {
        mkdirp.sync('app/css/sprites');
        mkdirp.sync('app/images/sprites');

        this.fs.copy(
          this.templatePath('emptyfile'),
          this.destinationPath('app/css/sprites/index' + this.cssExtension)
        );

        this.fs.copy(
          this.templatePath('emptyfile'),
          this.destinationPath('app/images/sprites/.gitkeep')
        );
      }

    },

    packageJSON: function () {
      this.template('_package.json', 'package.json');
    },

    gulpfile: function () {
      this.template('gulpfile.js', 'gulpfile.js');
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
      );
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    git: function () {
      this.copy('gitignore', '.gitignore');
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    this.log(yosay('All done! Run `npm start` to preview your app and watch for changes.'));
  }

});
