import { Vector2 } from 'three';
import { mapRange } from '../../../utils/math';

class CanvasHeightMap {
  constructor() {}

  init(mapTexture) {
    console.log('canvas');
    this.imageData = mapTexture.image;
    this.size = { width: 512, height: 512 };
    this.STEPSIZE = 512 / 122;
    this.POINT = { radius: 5 };
    this.show = true;
    this.center = new Vector2(this.size.width / 2, this.size.height / 2);
    this.position = new Vector2();
    this.normalizedValue = 0;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.id = 'canvasLayer';
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;
    this.canvas.style.zIndex = '1';
    this.canvas.style.bottom = '0';
    this.canvas.style.right = '0';
    this.canvas.style.position = 'absolute';
    this.canvas.style.transformOrigin = 'right bottom';
    this.canvas.style.transform = 'scale(.75)';
    document.body.appendChild(this.canvas);
    this.drawImage();

    // this.imageData = new Image();
    // this.imageData.crossOrigin = 'Anonymous';
    // this.imageData.src = Map;
    // this.imageData.onload = () => {
    //   this.drawImage();
    // };
  }

  updatePosition(vPosXZ) {
    this.position.x = this.center.x + vPosXZ.x * this.STEPSIZE;
    this.position.y = this.center.y + vPosXZ.y * this.STEPSIZE;
    this.drawImage();
    // console.log(this.ctx.getImageData(this.position.x, this.position.y, 1, 1).data[0]);
    const sample = this.ctx.getImageData(this.position.x, this.position.y, 1, 1).data[0];
    this.normalizedValue = mapRange(sample, 0, 255, 0, 1);
    this.drawPointer();
  }

  getNormalizedHeight() {}

  drawImage() {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
    this.ctx.drawImage(this.imageData, 0, 0, this.size.width, this.size.height);
  }

  drawPointer() {
    this.ctx.beginPath();
    this.ctx.arc(this.position.x, this.position.y, this.POINT.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = '#e71313';
    this.ctx.fill();
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
  }

  dispose() {
    document.body.removeChild(this.canvas);
  }
}

export default CanvasHeightMap;
