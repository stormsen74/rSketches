const regularCompare = (a, b) => {
  if (a === b) {
    return 0;
  } else if (a < b) {
    return -1;
  } else {
    return 1;
  }
};

export const median = (samples, compareFn = null) => {
  const len = samples.length;
  const comp = compareFn || regularCompare;
  const i = Math.floor(len / 2);
  return [...samples].sort(comp)[i];
};

export const average = (samples) => {
  const len = samples.length;
  const sum = samples.reduce((acc, s) => acc + s);
  return sum / len;
};

export const runMedian = (length, samples, newValue, compareFn = null) => {
  samples.push(newValue);
  if (samples.length > length) {
    samples.shift();
  }
  return median(samples, compareFn);
};

export const runAverage = (length, samples, newValue) => {
  samples.push(newValue);
  if (samples.length > length) {
    samples.shift();
  }
  return average(samples);
};

export const getRandomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const floatRandomBetween = (min, max) => {
  return Math.random() * (max - min + 1) + min;
};

export const mapRange = (value, x1, y1, x2, y2) => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
