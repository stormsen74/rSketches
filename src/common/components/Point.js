export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  add(p) {
    this.x += p.x;
    this.y += p.y;
  }
}
