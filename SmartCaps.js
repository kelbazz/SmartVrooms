class SmartCaps extends Capsule {
  constructor(x1, y1, x2, y2, r, m, data) {
    super(x1, y1, x2, y2, r, m);
    this.brain = NeuralNetwork.from(
      data
        ? data
        : '{"iLayerSize":5,"hLayerSize":5,"oLayerSize":4,"iInputValues":[193.22694298686747,64.4156633774645,59.61595852437589,199.99999999999997,66.83895487072056],"hPerc":[{"inputs":[193.22694298686747,64.4156633774645,59.61595852437589,199.99999999999997,66.83895487072056],"weights":[-0.793195491684759,0.31957333501209906,-0.4677654579962982,0.6298008793839505,-0.28775637189047076],"bias":-0.2576068310311288,"size":5},{"inputs":[193.22694298686747,64.4156633774645,59.61595852437589,199.99999999999997,66.83895487072056],"weights":[-0.9997500450066883,-0.8338378783805198,-0.5281283418781757,-0.1664666244519899,-0.43530947484640503],"bias":0.7552413192187686,"size":5},{"inputs":[193.22694298686747,64.4156633774645,59.61595852437589,199.99999999999997,66.83895487072056],"weights":[-0.24078036960799754,0.20043141647267682,0.2923480270656569,-0.7317885555692416,0.485469876871202],"bias":-0.2996098366278055,"size":5},{"inputs":[193.22694298686747,64.4156633774645,59.61595852437589,199.99999999999997,66.83895487072056],"weights":[0.22361631508019064,-0.3261423001403507,-0.9912038617164916,0.07319268368705734,0.05060333310126364],"bias":0.1083643900432123,"size":5},{"inputs":[193.22694298686747,64.4156633774645,59.61595852437589,199.99999999999997,66.83895487072056],"weights":[-0.07255962463165178,-0.136377733043076,0.32374724364850316,-0.49886051223126104,0.5714404108372757],"bias":-0.596982122371291,"size":5}],"hOutputValues":[-1,-1,-1,-1,-1],"oPerc":[{"inputs":[-1,-1,-1,-1,-1],"weights":[-0.5279180675629043,0.7511488356839169,0.7893467859663921,-0.2904228743309294,0.5714933622085452],"bias":0.01728396300438284,"size":5},{"inputs":[-1,-1,-1,-1,-1],"weights":[0.6460396622168711,-0.5035443462418905,-0.016205646439424015,0.0029628690303522554,-0.4096410674599116],"bias":-0.2517855359283314,"size":5},{"inputs":[-1,-1,-1,-1,-1],"weights":[-0.09050712787932547,-0.7438897735494931,-0.5640228079870488,-0.8292116535583203,-0.8959664855566793],"bias":0.8533050249191878,"size":5},{"inputs":[-1,-1,-1,-1,-1],"weights":[0.265735170652627,0.7484750777891018,0.1625015706985664,-0.21491511356969273,0.6256328007221241],"bias":-0.8830838204242397,"size":5}],"oOutputValues":[-1,1,1,-1]}'
    );
    this.layer = -1;
    this.friction = 0.06;
    this.angFriction = 0.05;
    this.maxSpeed = 5;
    this.setColor("#0099ff");
    this.comp[1].color = "#0099ff";
    this.fitness = 0;
    this.reward = 0;
    this.sensors = {
      start: new Vector(0, 0),
      dist: 200,
      dir: [],
      line: new Line(0, 0, 0, 0),
    };
    this.sensors.line.color = "#0000";
    this.sensorValues = [];
  }

  // iterating through the brain array and changing the acceleration accordingly
  makeMove() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    if (this.brain.oOutputValues[0] === 1) {
      this.left = true;
    }
    if (this.brain.oOutputValues[1] === 1) {
      this.right = true;
    }
    if (this.brain.oOutputValues[2] === 1) {
      this.up = true;
    }
    if (this.brain.oOutputValues[3] === 1) {
      this.down = true;
    }
  }

  // the distance between the caps and a given point
  distance(vec) {
    return this.pos.subtr(vec).mag();
  }

  // counting the checklines crossed
  getReward() {
    if (collide(this, checkLines[this.reward % checkLines.length])) {
      this.reward++;
    }
  }

  // collects the distances to the closest wall towards various directions
  getSensorData(wallArray) {
    this.sensors.start.set(this.comp[1].pos.x, this.comp[1].pos.y);
    this.sensors.line.vertex[0] = this.sensors.start;
    this.sensors.dir[0] = this.comp[1].pos.subtr(this.comp[2].pos).unit();
    this.sensors.dir[1] = this.sensors.dir[0].normal();
    this.sensors.dir[2] = this.sensors.dir[1].normal().normal();
    this.sensors.dir[3] = this.sensors.dir[0].add(this.sensors.dir[1]).unit();
    this.sensors.dir[4] = this.sensors.dir[0].add(this.sensors.dir[2]).unit();
    for (let i = 0; i < 5; i++) {
      let closestPoint = this.sensors.start.add(
        this.sensors.dir[i].mult(this.sensors.dist)
      );
      wallArray.forEach((wall) => {
        let intersection = lineSegmentIntersection(
          this.sensors.line.vertex[0],
          closestPoint,
          wall.start,
          wall.end
        );
        if (
          intersection &&
          intersection.subtr(this.sensors.start).mag() <
            closestPoint.subtr(this.sensors.start).mag()
        ) {
          closestPoint = intersection;
          //   this.sensors.line.color = "red";
        }
      });
      this.sensorValues[i] = closestPoint.subtr(this.sensors.start).mag();
      //   testCircle(closestPoint.x, closestPoint.y, "green");
      this.sensors.line.vertex[1] = closestPoint;
      //   this.sensors.line.draw();
      //   this.sensors.line.color = "grey";
    }
    return this.sensorValues;
  }

  // stops modifying the direction properties and sets the acceleration vector to 0
  stop() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.acc.set(0, 0);
  }
}
