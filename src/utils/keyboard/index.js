const keyState = {};

export const handleKeyDown = (event) => {
  if (event.key) {
    keyState[event.key.toLowerCase()] = true;
  }
};

export const handleKeyUp = (event) => {
  if (event.key) {
    keyState[event.key.toLowerCase()] = false;
  }
};

export const handleBlur = () => {
  Object.keys(keyState).forEach((e) => {
    keyState[e] = false;
  });
};

export const isKeyPressed = (key) => {
  return keyState[key.toLowerCase()] || false;
};
