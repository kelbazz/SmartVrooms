class NeuralNetwork {
  constructor(i, h, o) {
    this.iLayerSize = i;
    this.hLayerSize = h;
    this.oLayerSize = o;
    this.iInputValues = Array.from({ length: i }, (v) => 1);
    this.hPerc = [];
    for (let i = 0; i < this.hLayerSize; i++) {
      this.hPerc.push(new Perceptron(this.iLayerSize));
    }
    this.hOutputValues = [];
    this.oPerc = [];
    for (let i = 0; i < this.oLayerSize; i++) {
      this.oPerc.push(new Perceptron(this.hLayerSize));
    }
    this.oOutputValues = [];
  }

  static from(str) {
    let brain = JSON.parse(str);
    let nn = new NeuralNetwork(
      brain.iLayerSize,
      brain.hLayerSize,
      brain.oLayerSize
    );

    brain.hPerc.forEach((perc, i) => {
        brain.hPerc[i] = Perceptron.from(perc);
    });

    brain.oPerc.forEach((perc, i) => {
        brain.oPerc[i] = Perceptron.from(perc);
    });

    for (let [k, _] of Object.entries(brain)) {
        nn[k] = brain[k];
    }

    return nn;
  }

  // setting the neural networks input values
  setInputValues(inputArray) {
    if (inputArray.length !== this.iLayerSize) {
      console.log("Wrong length of input array!");
      return false;
    }
    inputArray.forEach((input, i) => {
      this.iInputValues[i] = input;
    });
  }

  // implementing the feedforward algorithm
  feedForward() {
    this.hOutputValues = [];
    this.oOutputValues = [];
    this.hPerc.forEach((perc) => {
      perc.setInputs(this.iInputValues);
      this.hOutputValues.push(perc.getOutput());
    });
    this.oPerc.forEach((perc) => {
      perc.setInputs(this.hOutputValues);
      this.oOutputValues.push(perc.getOutput());
    });
    return this.oOutputValues;
  }
}
