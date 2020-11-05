var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var clean = require("gulp-clean");

const print = require("gulp-print").default;
const minify = require('gulp-minify');
const cleanCSS = require("gulp-clean-css");
const size = require("gulp-size");
const { on } = require("gulp");


// Get Bootstrap Assets
gulp.task("bs-scss", async () => {
  gulp
    .src("node_modules/bootstrap/scss/**/*")
    .pipe(gulp.dest("src/bootstrap/scss"));
});

gulp.task("bs-js", async () => {
  gulp
    .src("node_modules/bootstrap/dist/js/**/*")
    .pipe(gulp.dest("src/bootstrap/js"));
});

// Get Popper
gulp.task("popper-js", async () => {
  gulp
    .src("node_modules/popper.js/dist/popper.js")
    .pipe(gulp.dest("src/popper/"));
});

// Get all dependencies to src
gulp.task("get-src",
    gulp.series(gulp.series("bs-scss", "bs-js", "popper-js"))
);
  

// Processing Sass
gulp.task("sass", () => {
  return gulp
    .src("./sass/theme.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./assets/css"))
    .pipe(browserSync.stream());
});

// Generate SaSS with Source Maps
gulp.task("sass-maps", () => {
    return gulp
      .src("./sass/**/*.scss")
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))
      .pipe(sourcemaps.write("./maps"))
      .pipe(gulp.dest("./assets/css"))
      .pipe(browserSync.stream());
});
  

// Minify CSS
gulp.task("minify-css", () => {
  return gulp
    .src(["assets/css/*.css", "!assets/css/*.min.css"])
    .pipe(
      cleanCSS({ debug: true }, (details) => {
        console.log(`${details.name}: Size: ${details.stats.originalSize}`);
        console.log(`${details.name}: Minified to" ${details.stats.minifiedSize}`
        );
      })
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(size())
    .pipe(gulp.dest("assets/css/"))
});


// Cleaning
// Remove css/custom
gulp.task("clean-css", () => {
    return gulp.src("assets/css/custom", { read: false }).pipe(clean());
  });

// Delete generated assets
gulp.task("delete-assets",() => {
    return gulp.src("assets", { read: false }).pipe(clean());
});

// Delete generated CSS
gulp.task("delete-assets-css",() => {
    return gulp.src("assets/css", { read: false }).pipe(clean());
});

// Delete generated JS
gulp.task("delete-assets-js",() => {
    return gulp.src("assets/js", { read: false }).pipe(clean());
});

// Delete Sources
gulp.task("delete-src",() => {
    return gulp.src("src", { read: false }).pipe(clean());
});

// Styles [Run sass -> minify-css -> clean-css]
gulp.task(
  "styles",
  gulp.series(gulp.series("sass", "minify-css"))
);

// Get Scripts
gulp.task('scripts',async () => {
    gulp.src(['src/bootstrap/js/bootstrap.js', 'src/popper/popper.js','js/**/*.js'])
    .pipe(minify({
        ext: {
            min: '.min.js' // Set the file extension for minified files to just .js
        },
        noSource: true // Don’t output a copy of the source file
    }))
      .pipe(gulp.dest('assets/js'))
});


// Start Server & BrowserSync
gulp.task(
  "start",
  gulp.series("styles","scripts", function () {
    browserSync.init({
      server: "./",
    });

    gulp.watch("sass/**/*.scss", gulp.series("styles"));
    gulp.watch("src/**/*.js", gulp.series("scripts"));
    gulp.watch("js/**/*.js", gulp.series("scripts"));
    gulp.watch("./*.html").on("change", browserSync.reload);
    gulp.watch("./*.php").on("change", browserSync.reload);
  })
);

gulp.task("default", gulp.series("start"));
