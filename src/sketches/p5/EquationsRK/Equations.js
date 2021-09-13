export class Equations {
  constructor() {
    this.type = ''
    this.equations = {
      '|sin(y),sin(x)|': [
        x => {
          return Math.sin(x)
        },
        (x, y) => {
          return Math.sin(y)
        },
      ],
      '|cos(x^2+y),x+y^2+1|': [
        (x, y) => {
          return x + Math.pow(y, 2) + 1
        },
        (x, y) => {
          return Math.cos(Math.pow(x, 2) + y)
        },
      ],
      '|x^2,y^2|': [
        (x, y) => {
          return Math.pow(y, 2)
        },
        x => {
          return Math.pow(x, 2)
        },
      ],
      '|y^2,x^2|': [
        x => {
          return Math.pow(x, 2)
        },
        (x, y) => {
          return Math.pow(y, 2)
        },
      ],
      '|x^2-y^2,x+y|': [
        (x, y) => {
          return x + y
        },
        (x, y) => {
          return Math.pow(x, 2) - Math.pow(y, 2)
        },
      ],
      '|x,y|': [
        x => {
          return x
        },
        (x, y) => {
          return y
        },
      ],
      '|y,x|': [
        (x, y) => {
          return y
        },
        x => {
          return x
        },
      ],
      '|y,-x|': [
        (x, y) => {
          return y
        },
        x => {
          return -x
        },
      ],
      // type | slopeY(x,y) | slopeX(x,y)
      "y'=cos(xy)": [
        (x, y) => {
          return Math.cos(x * y)
        },
        () => {
          return 1
        },
      ],
      "y'=x+y": [
        (x, y) => {
          return x + y
        },
        () => {
          return 1
        },
      ],
      "y'=sin(x)cos(y)": [
        (x, y) => {
          return Math.sin(x) * Math.cos(y)
        },
        () => {
          return 1
        },
      ],
      "y'=cos(x)*y^2": [
        (x, y) => {
          return Math.cos(x) * y * y
        },
        () => {
          return 1
        },
      ],
      "y'=log(x)log(y)": [
        (x, y) => {
          return Math.log(Math.abs(x)) * Math.log(Math.abs(y))
        },
        () => {
          return 1
        },
      ],
      "y'=tan(x)cos(y)": [
        (x, y) => {
          return Math.tan(x) * Math.cos(y)
        },
        (x, y) => {
          return 1
        },
      ],
      "y'=4cos(y)(1-y)": [
        (x, y) => {
          return 4 * Math.cos(y) * (1 - y)
        },
        () => {
          return 1
        },
      ],
      Pendulum: [
        x => {
          return -Math.sin(x)
        },
        (x, y) => {
          return y
        },
      ],
      Oval: [
        x => {
          return -2 * x
        },
        (x, y) => {
          return y
        },
      ],
      "x''=-g*x'-sin(x)+F": [
        (x, y) => {
          return -y - Math.sin(1.5 * x) + 0.7
        },
        (x, y) => {
          return 1.5 * y
        },
      ],
      'Lotka-Volterra': [
        (x, y) => {
          return -y * (1 - x)
        },
        (x, y) => {
          return x * (1 - y)
        },
      ],
      Spiral: [
        (x, y) => {
          return -x - y
        },
        (x, y) => {
          return y
        },
      ],
      'Diamonds periodic': [
        x => {
          return Math.sin(x)
        },
        (x, y) => {
          return Math.cos(y)
        },
      ],
      'Diamonds sinks': [
        (x, y) => {
          return Math.sin(x) * Math.cos(y)
        },
        (x, y) => {
          return Math.sin(y) * Math.cos(x)
        },
      ],
      'Random linear': [
        () => {
          return Math.random()
        },
        () => {
          return Math.random()
        },
      ],
      'Double rotational': [
        x => {
          x = x / 4
          return x - x * x * x
        },
        (x, y) => {
          return y / 4
        },
      ],
      'Circle attractor': [
        (x, y) => {
          x = x / 5
          y = y / 5
          return x + y - y * (x * x + y * y)
        },
        (x, y) => {
          x = x / 5
          y = y / 5
          return x - y - x * (x * x + y * y)
        },
      ],
      'Non Linear 1': [
        (x, y) => {
          return y * (-1 + x)
        },
        (x, y) => {
          return x * (-x + 5) - y * x
        },
      ],
      'van der Pol': [
        (x, y) => {
          return 0.6 * (-(0.7 * 0.7 * x * x - 1) * 0.7 * y - 0.7 * x)
        },
        (x, y) => {
          return 0.6 * (0.7 * y)
        },
      ],
      'Non Linear 2': [
        (x, y) => {
          return 4 - x * x - y * y
        },
        (x, y) => {
          return x * (y - 1)
        },
      ],
      'Source & Sink': [
        (x, y) => {
          return 2 * 0.5 * 0.5 * x * y
        },
        (x, y) => {
          return 0.5 * 0.5 * x * x - 0.5 * 0.5 * y * y - 1
        },
      ],
      Doublet: [
        (x, y) => {
          return -(2 * 0.5 * 0.5 * x * y) / Math.pow(0.5 * 0.5 * x * x + 0.5 * 0.5 * y * y, 2)
        },
        (x, y) => {
          return (
            (Math.pow(0.5 * x, 4) +
              0.5 * 0.5 * x * x * (2 * 0.5 * 0.5 * y * y - 1) +
              Math.pow(0.5 * y, 4) +
              0.5 * 0.5 * y * y) /
            Math.pow(0.5 * 0.5 * x * x + 0.5 * 0.5 * y * y, 2)
          )
        },
      ],
    }
  }

  getSlopeY(x, y) {
    return this.equations[this.type][0](x, y)
  }

  getSlopeX(x, y) {
    return this.equations[this.type][1](x, y)
  }

  getTypes() {
    return Object.keys(this.equations)
  }

  setType(type) {
    this.type = type
  }
}
