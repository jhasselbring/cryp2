let argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const { showHelp } = require('./inc/help.js');
const { setup, single, multi } = require("./inc/actions.js");
let { loadingBar } = require("./inc/state.js");


if (argv.help || argv.h) {
    showHelp();
} else {
    main();
}

function main() {
    argv = setup(argv);
    let stats = fs.statSync(argv.target);

    if (stats.isFile()) {
        total = 1;
        current = 1;
        loadingBar.start(1, 0);
        single(argv.target)
    } else if (stats.isDirectory()) {
        multi(argv.target)
    }
}