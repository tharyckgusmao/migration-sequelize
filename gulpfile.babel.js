import gulp from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import path from "path";
import del from "del";
import runSequence from "run-sequence";

const plugins = gulpLoadPlugins();

const paths = {
  js: ["./**/*.js", "!dist/**", "!node_modules/**", "!coverage/**"],
  nonJs: [
    "./package.json",
    "./.gitignore",
    "./.env",
    "files",
    "logs",
    "./**/*.ejs",
  ],
  tests: "./server/tests/*.js",
};

gulp.task("clean", () =>
  del.sync(["dist/**", "dist/.*", "coverage/**", "!dist", "!coverage"])
);

gulp.task("copy", () =>
  gulp.src(paths.nonJs).pipe(plugins.newer("dist")).pipe(gulp.dest("dist"))
);

gulp.task("babel", () =>
  gulp
    .src([...paths.js, "!gulpfile.babel.js"], { base: "." })
    .pipe(plugins.newer("dist"))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel())
    .pipe(
      plugins.sourcemaps.write(".", {
        includeContent: false,
        sourceRoot(file) {
          return path.relative(file.path, __dirname);
        },
      })
    )
    .pipe(gulp.dest("dist"))
);

// default task: clean dist, compile js files and copy non-js files.
gulp.task("default", ["clean"], () => {
  runSequence(["copy", "babel"]);
});
