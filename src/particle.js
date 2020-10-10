
const width = window.innerWidth; // Math.min(800, window.innerWidth);
const height = window.innerHeight;  // Math.min(600, window.innerHeight);

// This class refers to the snowflake example
// https://p5js.org/examples/simulate-snowflakes.html
// The original sample code is provided under the CC BY-NC-SA 4.0 license.
// https://creativecommons.org/licenses/by-nc-sa/4.0/
export class FallingObject {
  constructor(p5) {
    // initialize coordinates
    this.p5 = p5;
    this.posX = 0;
    this.posY = p5.random(-50, 0);
    this.initialangle = p5.random(0, 2 * Math.PI);
    this.size = p5.random(3, 7);

    // radius of snowflake spiral
    // chosen so the snowflakes are uniformly spread out in area
    this.radius = Math.sqrt(this.p5.random(Math.pow(width / 2, 2)));
  }
  update(time) {
    // x position follows a circle
    let w = 0.1; // angular speed
    let angle = w * time + this.initialangle;
    this.posX = width / 2 + this.radius * Math.sin(angle);

    // different size snowflakes fall at slightly different y speeds
    this.posY += Math.pow(this.size, 0.5);
  }

  y() {
    return this.posY;
  }
}

export class SnowFlake extends FallingObject {
  display() {
    this.p5.fill(this.p5.color(255, 255, 255));
    this.p5.noStroke();
    this.p5.ellipse(this.posX, this.posY, this.size);
  }
}

export class Character extends FallingObject {
  constructor(p5, text, size) {
    super(p5);
    this.text = text;
    this.size = size;
  }

  display() {
    this.p5.fill(255, 255, 255);
    this.p5.textSize(this.size);
    this.p5.text(this.text, this.posX, this.posY);
  }
}
