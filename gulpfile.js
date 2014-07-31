//gulp
var gulp = require('gulp');
//plugins
var csslint = require('gulp-csslint'),
	jshint = require('gulp-jshint'),
	minifyCss = require('gulp-minify-css'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	gulpIf = require('gulp-if'),
	runSeq = require('run-sequence'),
	watch = require('gulp-watch'),
	clean = require('gulp-clean'),
	eventStream = require('event-stream'),
	concat = require('gulp-concat'),
	merge = require('merge-stream')
	html2js = require('gulp-html2js');
//globs
var srcDir = 'ui/dev/',
	distDir = 'ui/dist/',
	sassFiles = srcDir + '**/*.scss',
	jsFiles = srcDir + 'app.js',
	mockJsFiles = srcDir + 'app.mock.js',
	htmlFiles = [
		srcDir + '**/*.html',
		'!' + srcDir + 'cdb-nodes/**/*.html'
	],
	htmlTplFile = [
		srcDir + 'cdb-nodes/**/*.html'
	],
	vendorJsFiles = [
		'bower_components/angular/angular.min.js',
		'bower_components/angular-route/angular-route.min.js',
		'bower_components/angular-animate/angular-animate.min.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
		'bower_components/angular-ui-tree/dist/angular-ui-tree.min.js'
	],
	vendorCssFiles = [
		'bower_components/bootstrap/dist/css/bootstrap.min.css',
		'bower_components/angular-ui-tree/dist/angular-ui-tree.min.css'
	],
	fontFiles = [
		'bower_components/bootstrap/dist/fonts/*'
	];

//vars
var isProd = false;

//tasks
gulp.task('default', ['watch']);

gulp.task('dev', ['vendor', 'html', 'js-dev', 'sass', 'tpl']);

gulp.task('prod', function() {
	isProd = true;
	runSeq(['dev']);
});

gulp.task('watch', ['dev'], function() {
	gulp.watch(sassFiles, ['sass']);
	gulp.watch([jsFiles, mockJsFiles], ['js-dev']);
	gulp.watch(htmlFiles, ['html']);
	gulp.watch(htmlTplFile, ['tpl']);
});

gulp.task('clean', function() {
	gulp.src(distDir, {read: false})
		.pipe(clean());
});

gulp.task('sass', function() {
	gulp.src(sassFiles)
		.pipe(sass())
		.pipe(csslint())
		.pipe(csslint.reporter())
		.pipe(concat("app.css"))
		.pipe(gulpIf(isProd, minifyCss()))
		.pipe(gulp.dest(distDir));
});

gulp.task('js-dev', function() {
	gulp.src([jsFiles, mockJsFiles])
		.pipe(jshint())
		.pipe(concat('app.js'))
		.pipe(gulp.dest(distDir));
});

gulp.task('js-prod', function() {
	gulp.src(jsFiles)
		.pipe(jshint())
		.pipe(uglify())
		.pipe(concat('app.js'))
		.pipe(gulp.dest(distDir));
});

gulp.task('tpl', function() {
	return gulp.src(htmlTplFile)
		.pipe(html2js({
			outputModuleName: 'cdb-nodes-templates',
			base: srcDir
		}))
		.pipe(concat('templates.js'))
		.pipe(gulpIf(isProd, uglify()))
		.pipe(gulp.dest(distDir + 'cdb-nodes/')); //Output folder
});

gulp.task('html', function() {
	gulp.src(htmlFiles)
		.pipe(gulp.dest(distDir));
});

gulp.task('vendor', function() {
	eventStream.merge(
		gulp.src(vendorJsFiles)
			.pipe(concat('vendor.js'))
			.pipe(gulp.dest(distDir + 'vendor')),
		gulp.src(vendorCssFiles)
			.pipe(concat('vendor.css'))
			.pipe(gulp.dest(distDir + 'vendor')),
		gulp.src(fontFiles)
			.pipe(gulp.dest(distDir + 'fonts')),
		gulp.src(srcDir + 'node-data.json')
			.pipe(gulp.dest(distDir))
	);
});