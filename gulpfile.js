var gulp = require("gulp");
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace'); //Rewrite occurences of filenames which have been renamed by gulp-rev 
var replace = require('gulp-replace') //string replace

var md5Value = function () {
            return Array.apply(0, Array(15)).map(function() {
                return (function(charset){
                    return charset.charAt(Math.floor(Math.random() * charset.length));
                }('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'));
            }).join('');
        }

var config = {
    source_path: "./manage_90/",
    source_advertiser_path: "./manage_90/Advertiser/",
    cdn_server: "http://cdn.yeahmobi.com/",
    dest_path: "./dist/",
    temp_path: "./temp/",
    fils_ext: "{js,css,html,png,jpg,gif,ico}",
    hash_value: md5Value()
}

gulp.task("copy_upload", function() {
    return gulp.src([config.source_path + "upload/**"])
        .pipe(gulp.dest(config.dest_path + "/upload"))
})

gulp.task("copy_htaccess", function() {
    return gulp.src([config.source_path + ".htaccess"])
        .pipe(gulp.dest(config.dest_path))
})

gulp.task("copy_other_files", function() {
    return gulp.src([config.source_path + "**/*.*",
            '!' + config.source_path + "**/*." + config.fils_ext
        ])
        .pipe(gulp.dest(config.dest_path))
})


gulp.task("mainjs", function() {
    gulp.src(config.source_path + "/static/script/main.js")
        .pipe(replace(/{assert_hash}/i, config.hash_value))
        .pipe(replace(/{cdn_server}/i, config.cdn_server))
        .pipe(gulp.dest(config.temp_path + "/static/script/"))
})



gulp.task("loginHtml", function() {
    gulp.src(config.source_path + "/login.html")
        .pipe(replace(/{assert_hash}/i, config.hash_value))
        .pipe(replace(/{cdn_server}/i, config.cdn_server))
        .pipe(gulp.dest(config.dest_path))
})

gulp.task("adv", function() {
    gulp.src([
            config.source_advertiser_path + "**/*." + config.fils_ext,
            '!' + config.source_advertiser_path + "*.html",
            //'!'+ config.source_path + "/Advertiser/sign-up.html"
        ])
        .pipe(rev({hash:config.hash_value}))
        .pipe(gulp.dest(config.dest_path + "/Advertiser"))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dest_path + "/Advertiser"))
        .on("end", function() {

            var manifest = gulp.src(config.dest_path + "/Advertiser/rev-manifest.json")
            gulp.src([config.source_advertiser_path + "*.html"])
                .pipe(revReplace({
                    manifest: manifest,
                    prefix: config.cdn_server
                }))
                .pipe(gulp.dest(config.dest_path + "/Advertiser"))
        })
})

gulp.task('default', ["copy_other_files", "loginHtml", "mainjs", "copy_upload", "copy_htaccess", "adv"], function() {
    return gulp.src([
            config.source_path + "**/*." + config.fils_ext,
            '!' + config.source_path + "*.html",
            '!' + config.source_advertiser_path + "*.html",
            //'!'+ config.source_path + "/Advertiser/sign-up.html"
        ])
        .pipe(rev({hash:config.hash_value}))
        .pipe(gulp.dest(config.dest_path))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dest_path))
        .on("end", function() {

            gulp.src([config.temp_path + "/static/script/*.*"])
                .pipe(rev({hash:config.hash_value}))
                .pipe(gulp.dest(config.dest_path + "/static/script/"))

            gulp.src(config.dest_path + "**/*.css")
                .pipe(replace(/.(png|jpg|gif)/g, "-" + config.hash_value + ".$1"))
                .pipe(gulp.dest(config.dest_path))

            gulp.src(config.dest_path + "**/*.html")
                .pipe(replace(/static\/(.+).(png|jpg|gif)/g, config.cdn_server + "static/$1"+"-" + config.hash_value + ".$2"))
                .pipe(gulp.dest(config.dest_path))


            var manifest = gulp.src(config.dest_path + "/rev-manifest.json")
            gulp.src([config.source_path + "/*.html",
                    '!' + config.source_path + "/login.html",
                    config.dest_path + "/login.html"
                ])
                .pipe(revReplace({
                    manifest: manifest,
                    prefix: config.cdn_server
                }))
                .pipe(gulp.dest(config.dest_path))
                .on("end", function() {
                    gulp.src([config.dest_path + "/static/**/*.html"])
                        .pipe(revReplace({
                            manifest: manifest,
                            prefix: config.cdn_server
                        }))
                        .pipe(gulp.dest(config.dest_path + "/static"))

                })

        })
})
