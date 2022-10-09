exports.showHelp = () => {
    console.log(`--disqualifier   -d      Sets disqualifying regex.`);
    console.log(`--help           -h      Displays help message.`);
    console.log(`                 -k      Keep the original file.`);
    console.log(`                 -l/-u   Sets mode.`);
    console.log(`--parallels      -p      Sets how many files can be processed simultanously.`);
    console.log(`--qualifier      -q      Sets qualifying regex.`);
    console.log(`                 -r      Enables recursive.`);
    console.log(`--secret         -s      Sets encoder.`);
    console.log(`--target         -t      Sets target file or directory.`);
    console.log(`                 -x      Enables dry run mode.`);
}