#!/usr/bin/env node

const moment = require('moment');
const { spawn } = require('child_process');

const args = [
  'stream',
  '--predicate', '(processImagePath contains "Dater") and senderImageUUID == processImageUUID',
  '--style', 'json',
];

const lg = spawn('log', args);

lg.stdout.on('data', (data) => {
  const str = data.toString();

  // Assumption: { is always at the end of a line, } at the start of line.
  const m = str.match(/\{$[\s\S]+?^\}/mg);
  if (m === null) {
    return;
  }

  const all = m.map((str1) => JSON.parse(str1));

  all.forEach(({ timestamp, eventMessage }) => {
    const time = moment(timestamp).format('H:mm:ss');

    console.log([time, eventMessage].join(', '));
    console.log('\n');
  });
});

lg.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

lg.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
