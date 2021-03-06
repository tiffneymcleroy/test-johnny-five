const five = require('johnny-five');
const _ = require('lodash');
const board = new five.Board();
const legServoPins = [12,       9, 8,     5];
const bodyServoPins = [  11, 10,     7, 6];

const mid = ([min, max]) => (min + max) / 2;
const max = ([min, max]) => max;
const min = ([min, max]) => min;

function walkCycle (allServos) {
  // Take advantage of position.  NOTE: brittle code!
  // Name Schema: (R"ight" || L"eft") + (B"ack" || F"ront") + (B"ody" || L"eg")
  //   e.g. LBL == "Left Back Leg"
  // const [min, max] = servo.range;
  //   meaning servo.range[0] === min, servo.range[1] === max
  const timing = 3000;
  const [
    LBL, LBB, LFB, LFL,
    RBL, RBB, RFB, RFL
  ] = allServos;
  const stateA = () => {
    // TODO: Pass in "time to complete servo movement" (body's 1000ms)
    // body
    LBB.to(min(LBB.range), timing);
    LFB.to(max(LFB.range), timing);
    RBB.to(min(RBB.range), timing);
    RFB.to(max(RFB.range), timing);
    // legs
    LBL.to(max(LBL.range));
    LFL.to(mid(LFL.range));
    RBL.to(mid(RBL.range));
    RFL.to(max(RFL.range));
  }
  const stateB = () => {
    // TODO: Pass in "time to complete servo movement" (body's 1000ms)
    // body
    LBB.to(max(LBB.range), timing);
    LFB.to(min(LFB.range), timing);
    RBB.to(max(RBB.range), timing);
    RFB.to(min(RFB.range), timing);
    // legs
    LBL.to(mid(LBL.range));
    LFL.to(max(LFL.range));
    RBL.to(max(RBL.range));
    RFL.to(mid(RFL.range));
  }
  stateB();  // initial state
  setInterval(() => {
    stateA();
    setTimeout(() => {
      stateB();
    }, timing);
  }, timing * 2);
}

board.on('ready', function () {
  const legServos = legServoPins.map((pin) =>
    new five.Servo({
      pin,
      range: [30, 135],
      startAt: 90
    }));
  const bodyServos = bodyServoPins.map(pin =>
    new five.Servo({
      pin,
      range: [45, 135],
      startAt: 90
    }));
  const allServos = [...legServos, ...bodyServos].sort((a, b) => a.pin > b.pin).reverse();
  this.repl.inject({
    legServos,
    bodyServos,
    allServos,
    walkCycle: () => walkCycle(allServos)
  });
  console.log('Execute walkCycle() to begin sequence.');
});
