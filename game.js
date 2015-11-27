var chalk = require('chalk');
var readline = require('readline');
var fs = require('fs');
var rps = require('rock-paper-scissors-lizard-spock-stream');
var airpaste = require('airpaste');

var Spinner = require('cli-spinner').Spinner;

var spinner = new Spinner('Waiting for opponent... %s');
spinner.setSpinnerString('⣾⣽⣻⢿⡿⣟⣯⣷');


var wins = 0;
var losses = 0;
var ties = 0;

var rl = readline.createInterface(process.stdin, process.stdout);

var weapons = ['rock','paper','scissors','lizard','spock'];

fs.readFile('intro.txt', renderIntro);

function renderIntro(err, data) {
    if (err) {
        console.err(err);
        process.exit(1);
    }
    readline.cursorTo(process.stdin,0,0);
    readline.clearScreenDown(process.stdin);

    var intro = data.toString().split('\n').reverse();
    var lastLine;
    var interval = setInterval(renderNextLine, 50);

    function renderNextLine() {
        lastLine = chalk.green(intro.pop()) + '\n';
        rl.write(lastLine);
        if (intro.length <= 0) {
            clearInterval(interval);
            waitForEnter()
        }
    }

}

var spinnerInterval;
function waitForEnter() {
    waitedForEnter();
    rl.on('line', startTheGame);
    function startTheGame() {
        rl.removeAllListeners('line');
        start();
    }
    spinnerInterval = setInterval(renderWaitForEnter, 400);
}

function waitedForEnter() {
    if (spinnerInterval) {
        clearInterval(spinnerInterval);
    }
}

var chuckle = true;
function renderWaitForEnter() {
    rl.write(null, {ctrl: true, name: 'u'});
    if (chuckle) {
        rl.write(' ')
    }
    chuckle = !chuckle;

    rl.write(chalk.blue(' PRESS ENTER TO START'));
}

function start() {
    waitedForEnter();
    readline.cursorTo(process.stdin,0,0);
    readline.clearScreenDown(process.stdin);
    rl.write('Current standings: w' + wins + ' - l' + losses + ' - t' + ties + '\n');
    renderChoices();
}

function renderChoices() {
    for (var i = 0; i < weapons.length; i++) {
        rl.write(chalk.white("[" +(i + 1) + "] ") + weapons[i] + '\n');
    }
    rl.question(chalk.blue('Choose your weapon wisely!'), readChoice)
}

function readChoice(data){
    if (data.length == 1 && data > 0 && data <= weapons.length) {
        rl.write('So you choose: ' + weapons[data - 1] + '\n');
        makeCall(weapons[data-1]);
    } else {
        readline.cursorTo(process.stdin,0,0);
        readline.clearScreenDown(process.stdin);
        rl.write('You have to enter a valid choice!\n');
        renderChoices();
    }
}

function makeCall(choice) {
    var stream = rps(choice); // pass in your choice
    var paste = airpaste();
    spinner.start();

    stream.on('win', function (you, opponent) {
        console.log('you won (%s vs %s)\n', you, opponent);
        wins++;
        spinner.stop();
        waitForEnter();
    });

    stream.on('lose', function (you, opponent) {
        console.log('you lost (%s vs %s)\n', you, opponent);
        losses++;
        spinner.stop();
        waitForEnter();
    });

    stream.on('tie', function (you, opponent) {
        console.log('you tied (%s vs %s)\n', you, opponent);
        ties++;
        spinner.stop();
        waitForEnter();
    });

    stream.pipe(paste).pipe(stream);
}

module.exports.start = start;