//@ts-check
export const toRadians = (degrees) => degrees * (Math.PI / 180);
export const toDegrees = (radians) => radians * (180 / Math.PI);

export const screenToSVGCoordinates = (svgEl, pageX, pageY) => {
  // @ts-ignore
  let pt = svgEl.createSVGPoint();

  // Set point coordinates (pageX, pageY; relative to the <HTML> element)
  pt.x = pageX;
  pt.y = pageY;

  // @ts-ignore
  pt = pt.matrixTransform(svgEl.getScreenCTM().inverse());
  return {
    x: pt.x,
    y: pt.y,
  };
};
