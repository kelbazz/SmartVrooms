// STEP 1: setting up the environment
// creating the starting objects and variables before starting the main loop
// for example:

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const xhr = new XMLHttpRequest();
xhr.open("GET", "./model.json", false);
xhr.send();

window.addEventListener("hashchange", () => location.reload());

const model = JSON.stringify(JSON.parse(xhr.responseText));

let raceWalls = [];
raceWalls.push(new Wall(240, 120, 120, 120));
raceWalls.push(new Wall(120, 120, 120, 360));
raceWalls.push(new Wall(120, 360, 480, 360));
raceWalls.push(new Wall(480, 360, 480, 120));
raceWalls.push(new Wall(360, 0, 360, 240));
raceWalls.push(new Wall(360, 240, 240, 240));
raceWalls.push(new Wall(0, 0, 640, 0));
raceWalls.push(new Wall(640, 0, 640, 480));
raceWalls.push(new Wall(640, 480, 0, 480));
raceWalls.push(new Wall(0, 480, 0, 0));
raceWalls.push(new Wall(600, 0, 600, 480));
raceWalls.forEach((line) => {
  line.setColor("#0099ff");
});

let checkLines = [];
checkLines.push(new Wall(10, 360, 110, 360));
checkLines.push(new Wall(10, 240, 110, 240));
checkLines.push(new Wall(10, 120, 110, 120));
checkLines.push(new Wall(120, 10, 120, 110));
checkLines.push(new Wall(240, 10, 240, 110));
checkLines.push(new Wall(250, 120, 350, 120));
checkLines.push(new Wall(240, 130, 240, 230));
checkLines.push(new Wall(130, 240, 230, 240));
checkLines.push(new Wall(240, 250, 240, 350));
checkLines.push(new Wall(360, 250, 360, 350));
checkLines.push(new Wall(370, 240, 470, 240));
checkLines.push(new Wall(370, 120, 470, 120));
checkLines.push(new Wall(480, 10, 480, 110));
checkLines.push(new Wall(490, 120, 590, 120));
checkLines.push(new Wall(490, 240, 590, 240));
checkLines.push(new Wall(490, 360, 590, 360));
checkLines.push(new Wall(480, 370, 480, 470));
checkLines.push(new Wall(360, 370, 360, 470));
checkLines.push(new Wall(240, 370, 240, 470));
checkLines.push(new Wall(120, 370, 120, 470));
checkLines.forEach((line) => {
  line.layer = -2;
  line.setColor("#0099ff55");
});

let counter = 0;
let stepCounter = 0;
let smartCapsPop = new SmartCapsPop(20);
let capsAreMoving = false;

function start(str) {
  if (!str) str = model;
  smartCapsPop.generation = 1;
  capsAreMoving = true;
  smartCapsPop.init(str);
  counter = 0;
  stepCounter = 0;
}
start(decodeURI(location.hash.substring(1)));

function nextGen() {
  smartCapsPop.replaceNextGen();
  counter = 0;
  stepCounter = 0;
  capsAreMoving = true;
}

document.querySelector(".load-from").onclick = () =>
  (location.hash = `#${encodeURI(document.querySelector(".load-inp").value)}`);

// STEP 2: defining the game logic
function gameLogic() {
  if (capsAreMoving) {
    if (counter % 3 === 0) {
      smartCapsPop.caps.forEach((caps) => {
        if (stepCounter < 300) {
          caps.brain.setInputValues(caps.getSensorData(raceWalls));
          caps.brain.feedForward();
          caps.makeMove();
        } else {
          caps.stop();
        }
        caps.getReward();
      });
      if (smartCapsPop.velocitySum() < 0.01 && stepCounter > 0) {
        capsAreMoving = false;
        smartCapsPop.setFitness();
        smartCapsPop.createNextGen();
      }
      stepCounter++;
      counter = 0;
    }
    counter++;
  } else {
    let bestCaps = null;
    smartCapsPop.caps.forEach((body) => {
      if (bestCaps === null || body.reward > bestCaps.reward) bestCaps = body;
    });

    const btnBestBrain = document.querySelector(".best-brain");
    btnBestBrain.disabled = false;
    btnBestBrain.onclick = () => {
      navigator.clipboard.writeText(JSON.stringify(bestCaps.brain));
    };

    nextGen();
  }
  smartCapsPop.caps.forEach((caps) => {
    ctx.fillStyle = "#0f1020";
    ctx.fillText(caps.reward, caps.comp[0].pos.x - 5, caps.comp[0].pos.y + 2);
  });
}

// STEP 3: handling the user input and the game loop
requestAnimationFrame(mainLoop);
