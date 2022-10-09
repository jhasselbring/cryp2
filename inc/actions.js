const fs = require('fs');
const path = require('path');
const recursive = require("recursive-readdir");
let { total, current, inProgress, list, loadingBar } = require("./state.js");
const { encrypt, dencrypt } = require("hexvault");
let argv;

function setup(params) {
    argv = params;
    if (!argv.disqualifier && argv.d) argv.disqualifier = argv.d;
    if (!argv.parallels && argv.p) argv.parallels = argv.p;
    if (!argv.parallels) argv.parallels = 1;
    if (!argv.qualifier && argv.q) argv.qualifier = argv.q;
    if (!argv.secret && argv.s) argv.secret = argv.s;
    if (!argv.secret) argv.secret = 1;
    if (!argv.target && argv.t) argv.target = argv.t;

    // -l and -u are either both defined or both undefined
    if (argv.l && argv.u || !argv.l && !argv.u) {
        // Assuming lock
        argv.l = true;
    }

    // Check if given target is valid
    if (!fs.existsSync(argv.target)) {
        console.error('You must provide a valid target.');
        process.exit(1);
    }

    return argv;
}
function deleteFile(file, cb) {
    fs.unlink(file, function (err) {
        if (err) console.error('Drror deleting ' + file, err);
        cb();
    });

}
function rename(from, to, cb) {
    fs.rename(from, to, (err) => {
        if (err) console.log('Error renaming ' + from, err);
        cb();
    })
}
function pushIfQualified(file) {
    if (argv.qualifier) {
        var tester = new RegExp(argv.qualifier);
        let baseName = path.basename(file);
        if (tester.test(baseName)) {
            list.push(file);
            return;
        } else {
            return;
        }
    }
    if (argv.disqualifier) {
        var tester = new RegExp(argv.disqualifier);
        let baseName = path.basename(file);
        if (tester.test(baseName)) {
            return;
        } else {
            list.push(file);
            return;
        }
    }
    list.push(file);
}
function checkInProgress(cb) {
    if (inProgress >= parseInt(argv.parallels)) {
        setTimeout(() => {
            checkInProgress(cb)
        }, 100);
    } else {
        cb();
    }
}
function processAll(list) {
    list.forEach(file => {
        checkInProgress(() => {
            single(file);
        })
    })
}
function pushIfQualified(file) {
    if (argv.qualifier) {
        var tester = new RegExp(argv.qualifier);
        let baseName = path.basename(file);
        if (tester.test(baseName)) {
            list.push(file);
            return;
        } else {
            return;
        }
    }
    if (argv.disqualifier) {
        var tester = new RegExp(argv.disqualifier);
        let baseName = path.basename(file);
        if (tester.test(baseName)) {
            return;
        } else {
            list.push(file);
            return;
        }
    }
    list.push(file);
}
function multi(dir) {
    if (argv.r) {
        recursive(dir, function (err, files) {

            files.forEach(file => {
                pushIfQualified(file);
            })
            total = list.length;
            current = list.length;
            loadingBar.start(total, 0);
            processAll(list);
        });
    } else {
        fs.readdir(dir, (error, files) => {
            if (error) {
                console.error('Unable to read dir.');
                process.exit(1);
            } else {
                files.forEach(file => {
                    let stats = fs.statSync(file);
                    if (stats.isFile()) {
                        pushIfQualified(file)
                    }
                });
                total = list.length;
                current = list.length;
                loadingBar.start(total, 0);
                processAll(list);
            }
        });
    }
}
function single(file) {
    if (argv.l) {
        if (argv.x) {
            console.log('Will lock ' + file);
        } else {
            inProgress++;
            // In case .cryp2 already exist
            if (fs.existsSync(file + '.cryp2')) {
                fs.unlinkSync(file + '.cryp2');
            }
            lock(file)
                .then(result => {
                    if (!argv.k) {
                        deleteFile(file, () => {
                            rename(file + '.cryp2', file, () => {
                                inProgress--;
                            });
                        })
                    }
                }).catch(result => {
                    inProgress--;
                });
        }
    } else {
        if (argv.x) {
            console.log('Will lock ' + file);
        } else {
            inProgress++;
            // In case .cryp2 already exist
            if (fs.existsSync(file + '.cryp2')) {
                fs.unlinkSync(file + '.cryp2');
            }
            unlock(file)
                .then(result => {
                    if (!argv.k) {
                        deleteFile(file, () => {
                            rename(file + '.cryp2', file, () => {
                                inProgress--;
                            });
                        })
                    }
                }).catch(result => {
                    inProgress--;
                });
        }
    }
    current--;
    loadingBar.update(total - current);
    if (current == 0) loadingBar.stop();
}
function lock(file) {
    return new Promise((resolve, reject) => {
        let readStream = fs.createReadStream(file);
        let writeStream = fs.createWriteStream(file + '.cryp2');

        // Read has ended but don't return yet because write might not be done
        readStream.on('end', () => {
            ended = true;
            resolve({ success: true });
        });
        // Reject immediately on error
        readStream.on('error', () => {
            writeStream.end();
            reject({ success: false });
        })

        writeStream.on('close', () => {
        });
        // Reject immediately on error
        writeStream.on('error', () => {
            writeStream.end();
            reject({ success: false });
        });

        readStream.pipe(encrypt(argv.secret)).pipe(writeStream);
    })
}
function unlock(file) {
    return new Promise((resolve, reject) => {
        let readStream = fs.createReadStream(file);
        let writeStream = fs.createWriteStream(file + '.cryp2');

        // Read has ended but don't return yet because write might not be done
        readStream.on('end', () => {
            ended = true;
            resolve({ success: true });
        });
        // Reject immediately on error
        readStream.on('error', () => {
            writeStream.end();
            reject({ success: false });
        })

        writeStream.on('close', () => {
        });
        // Reject immediately on error
        writeStream.on('error', () => {
            writeStream.end();
            reject({ success: false });
        });

        readStream.pipe(dencrypt(argv.secret)).pipe(writeStream);
    })
}
exports.deleteFile = deleteFile;
exports.rename = rename;
exports.setup = setup;
exports.checkInProgress = checkInProgress;
exports.processAll = processAll;
exports.pushIfQualified = pushIfQualified;
exports.single = single;
exports.multi = multi;