/************************************************************
 * 
/ Pahina Starter Template with SaSS
/ Version: 1.0.1
/ GitHub URI: https://github.com/jahzlariosa/pahina-bs5-sass
/ Bootstrap Version: 5.0.0-alpha2
/ Popper Version: 1.16.1
/ Author: Joseph Lariosa
/ Author URI: https://josephlariosa.com

************************************************************/

var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var clean = require("gulp-clean");
var log = require("fancy-log");
const minify = require("gulp-minify");
const cleanCSS = require("gulp-clean-css");
const size = require("gulp-size");
const imagemin = require("gulp-imagemin");

var cfg = require("./gulpconfig.json");
var paths = cfg.paths;

// Get Bootstrap Assets
gulp.task("bs-scss", async () => {
  gulp
    .src(paths.node + "/bootstrap/scss/**/*")
    .pipe(gulp.dest(paths.dev + "/bootstrap/scss"));
});

gulp.task("bs-js", async () => {
  gulp
    .src(paths.node + "/bootstrap/dist/js/**/*")
    .pipe(gulp.dest(paths.dev + "/bootstrap/js"));
});

// Get Popper
gulp.task("popper-js", async () => {
  gulp
    .src(paths.node + "/popper.js/dist/popper.js")
    .pipe(gulp.dest(paths.dev + "/popper/"));
});

// Follow the format above to add new dependencies and add to get-src
// Get all dependencies to src
gulp.task("get-src", gulp.series(gulp.series("bs-scss", "bs-js", "popper-js")));

// Pre-Process
// Processing Theme Sass
gulp.task("sass", () => {
  return gulp
    .src(paths.sass + "/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.write(paths.maps))
    .pipe(gulp.dest(paths.assets + paths.css))
    .pipe(browserSync.stream());
});

// Minify CSS
gulp.task("minify-css", () => {
  return gulp
    .src([
      paths.assets + paths.css + "/*.css",
      "!" + paths.assets + paths.css + "/*.min.css",
    ]) // Excludes existing .min.css
    .pipe(
      cleanCSS({ debug: true }, (details) => {
        console.log(`${details.name}: Size: ${details.stats.originalSize}`);
        console.log(
          `${details.name}: Minified to" ${details.stats.minifiedSize}`
        );
      })
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(size())
    .pipe(gulp.dest(paths.assets + paths.css));
});

// Cleaning
// Remove css/custom
gulp.task("clean-css", () => {
  return gulp
    .src(paths.assets + paths.css + paths.custom, { read: false })
    .pipe(clean());
});

// Delete generated assets
gulp.task("delete-assets", () => {
  return gulp.src(paths.assets, { read: false }).pipe(clean());
});

// Delete generated CSS
gulp.task("reset-assets-css", () => {
  return gulp.src(paths.assets + paths.css, { read: false }).pipe(clean());
});

// Delete generated JS
gulp.task("reset-assets-js", () => {
  return gulp.src(paths.assets + paths.js, { read: false }).pipe(clean());
});

// Delete generated JS
gulp.task("reset-assets-img", () => {
  return gulp.src(paths.assets + paths.img, { read: false }).pipe(clean());
});

// Delete Sources
// Be very careful using this as you'll need to generate the correct tree to process all files again
// Default tree
// src
// |-img
// |-js
gulp.task("delete-src", () => {
  return gulp.src(paths.dev, { read: false }).pipe(clean());
});

// Delete dist
gulp.task("delete-dist", () => {
  return gulp.src(paths.dist, { read: false }).pipe(clean());
});

// Styles [Run sass -> minify-css -> clean-css]
gulp.task("styles", gulp.series(gulp.series("sass", "minify-css")));

// Get Scripts
gulp.task("scripts", async () => {
  gulp
    .src(paths.dev + "/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write(paths.maps))
    .pipe(
      minify({
        ext: {
          min: ".min.js", // Set the file extension for minified files to .min.js
        },
        noSource: true, // Don’t output a copy of the source file
      })
    )
    .pipe(gulp.dest(paths.assets + paths.js));
});

// Image Optimization
gulp.task("imagemin", async () => {
  gulp
    .src(paths.imgsrc)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(paths.assets + paths.img));
});

// Build
gulp.task(
  "build-assets",
  gulp.series(gulp.series("sass", "minify-css", "scripts", "imagemin"))
);

gulp.task(
  "build-prod",
  gulp.series(
    gulp.series("build-assets", async () => {
      gulp
        .src([
          paths.assets + paths.css + paths.themeCss,
          paths.assets + paths.css + paths.themeCssMin,
        ])
        .pipe(gulp.dest(paths.dist + paths.css));
      gulp
        .src([
          paths.assets + paths.js + "/theme.*",
          paths.assets + paths.js + paths.bootstrap + "/js/bootstrap.min.js",
          paths.assets + paths.js + paths.popper + "/popper.min.js",
        ])
        .pipe(gulp.dest(paths.dist + paths.js));
      gulp
        .src([
          paths.assets + paths.img + "/*"
        ])
        .pipe(gulp.dest(paths.dist + paths.img));
    })
  )
);

// Start Server & BrowserSync
gulp.task(
  "start",
  gulp.series("styles", "scripts", "imagemin", function () {
    browserSync.init(cfg.browserSyncOptions);
    gulp.watch(paths.sass + "/**/*.scss", gulp.series("styles"));
    gulp.watch(paths.dev + "/**/*.js", gulp.series("scripts"));
    gulp.watch(paths.imgsrc, gulp.series("imagemin"));
    gulp.watch("./*.html").on("change", browserSync.reload);
    gulp.watch("./*.php").on("change", browserSync.reload);
  })
);

gulp.task("default", gulp.series("start"));
