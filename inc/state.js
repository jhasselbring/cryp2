const cliProgress = require('cli-progress');

let total = 0;
let current = 0;
let inProgress = 0;
let list = [];
const loadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

exports.total = total;
exports.current = current;
exports.inProgress = inProgress;
exports.list = list;
exports.loadingBar = loadingBar;

