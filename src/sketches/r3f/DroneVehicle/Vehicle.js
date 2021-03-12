import { Matrix4, Quaternion, Vector3 } from 'three';
import { mapRange } from '../../../utils/math';

const FRICTION = 0.1;
const SEEK_MAX_SPEED = 5.0;
const SEEK_MAX_FORCE = 0.035;
const SEEK_RADIUS = 3;
const UP_AXIS = new Vector3(0, 1, 0);

class Vehicle {
  constructor() {}

  init(refCubeMesh) {
    this.refCubeMesh = refCubeMesh;
    this.mass = 1;
    this.rotation = 0;
    this.accelerationForce = 0;
    this.location = new Vector3();
    this.velocity = new Vector3();
    this.direction = new Vector3();
    this.vecDesired = new Vector3();
    this.vSteer = new Vector3();
    this.acceleration = new Vector3();
    this.quaternion = new Quaternion();
    this.quaternion.setFromAxisAngle(UP_AXIS, 0);
  }

  rotate(angularDirection) {
    this.rotation += angularDirection * 0.05;
    this.quaternion.setFromAxisAngle(UP_AXIS, this.rotation);
  }

  seek(vTarget) {
    this.vecDesired = vTarget.clone().sub(this.location);
    const distanceToTarget = this.vecDesired.length();

    const rotationMatrix = new Matrix4();
    rotationMatrix.lookAt(vTarget, this.location, UP_AXIS);
    this.quaternion.setFromRotationMatrix(rotationMatrix);

    if (distanceToTarget < SEEK_RADIUS) {
      const m = mapRange(distanceToTarget, 0, SEEK_RADIUS, 0, 1);
      this.vecDesired.multiplyScalar(m);
    } else {
      this.vecDesired.normalize();
      this.vecDesired.multiplyScalar(SEEK_MAX_SPEED);
    }

    this.vSteer = this.vecDesired.sub(this.velocity);
    this.vSteer.clampLength(0, SEEK_MAX_FORCE);
    this.applyForce(this.vSteer);
    this.applyFriction();
  }

  move(forceDirection) {
    this.accelerationForce += 0.0005;
    this.refCubeMesh.getWorldDirection(this.direction);
    this.direction.normalize().multiplyScalar(this.accelerationForce * forceDirection);
    this.applyForce(this.direction);
  }

  break() {
    this.accelerationForce = 0;
  }

  applyForce(vForce) {
    const force = vForce.divideScalar(this.mass);
    this.acceleration.add(force);
  }

  applyFriction() {
    this.vFriction = this.velocity.clone();
    this.vFriction.negate();
    this.vFriction.normalize();
    this.vFriction.multiplyScalar(this.velocity.length() * FRICTION);
    this.applyForce(this.vFriction);
  }

  update() {
    this.applyFriction();
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, 0.25);
    this.location.add(this.velocity);
    this.acceleration.multiplyScalar(0);
  }

  dispose() {}
}

export default Vehicle;
