//gulp
var gulp = require("gulp");
//plugins
var csslint = require("gulp-csslint"),
	jshint = require("gulp-jshint"),
	minifyCss = require("gulp-minify-css"),
	sass = require("gulp-sass"),
	uglify = require("gulp-uglify"),
	gulpIf = require("gulp-if"),
	runSeq = require("run-sequence"),
	watch = require("gulp-watch"),
	clean = require("gulp-clean"),
	eventStream = require("event-stream");
//globs
var srcDir = "src/",
	distDir = "dist/",
	sassFiles = srcDir + "app.scss",
	jsFiles = srcDir + "app.js",
	htmlFiles = [
		srcDir + "**/*.html"
	],
	vendorFiles = [
		"bower_components/angular/angular.min.js",
		"bower_components/angular-route/angular-route.min.js",
		"bower_components/bootstrap/dist/css/bootstrap.min.css",
		"bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
		"bower_components/fuzzyset.js/lib/fuzzyset.js"
	],
	fontFiles = [
		"bower_components/bootstrap/dist/fonts/*"
	];
//vars
var isProd = false;

//tasks
gulp.task("default", ["watch"]);

gulp.task("dev", ["vendor", "html", "js", "sass"]);

gulp.task("sass", function() {
	gulp.src(sassFiles)
		.pipe(sass())
		.pipe(csslint())
		.pipe(csslint.reporter())
		.pipe(gulpIf(isProd, minifyCss()))
		.pipe(gulp.dest(distDir));
});

gulp.task("js", function() {
	gulp.src(jsFiles)
		.pipe(jshint())
		.pipe(gulpIf(isProd, uglify()))
		.pipe(gulp.dest(distDir));
});

gulp.task("html", function() {
	gulp.src(htmlFiles)
		.pipe(gulp.dest(distDir));
});

gulp.task("vendor", function() {
	eventStream.merge(
		gulp.src(vendorFiles)
			.pipe(gulp.dest(distDir + "vendor")),
		gulp.src(fontFiles)
			.pipe(gulp.dest(distDir + "fonts"))
	);
});

gulp.task("watch", ["dev"], function() {
	gulp.watch(sassFiles, ["sass"]);
	gulp.watch(jsFiles, ["js"]);
	gulp.watch(htmlFiles, ["html"]);
});

gulp.task("prod", function() {
	isProd = true;

	runSeq("dev");
});

gulp.task("clean", function() {
	gulp.src(distDir, {read: false})
		.pipe(clean());
});

