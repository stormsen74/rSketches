import create from 'zustand';

export const appStates = create((set) => ({
  debug: false,
  sketch: null,
  sketchRef: null,
  size: { width: 0, height: 0 },
  setSketch: (value) => set(() => ({ sketch: { ...value } })),
  setSketchRef: (value) => set(() => ({ sketchRef: value })),

  // init: () => {
  //   const onResize = () => {
  //     const width = window.innerWidth;
  //     const height = window.innerHeight;
  //     set(() => ({ size: { width: width, height: height } }));
  //   };
  //   window.addEventListener('resize', onResize);
  //   onResize();
  // },
}));
