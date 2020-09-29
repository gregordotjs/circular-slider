export const SVG = "svg";
export const CIRCLE = "circle";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
 
/**
 * Create a SVG element based on the attributes and type.
 * @param  {{}} attributes
 * @param  {string} type
 * @return {SVGElement} return a SVG element
 */
export function generateSVGElement(attributes, type) {
  const svgEl = document.createElementNS(SVG_NAMESPACE, type);
  for (const key in attributes) {
    svgEl.setAttributeNS(null, key, attributes[key]);
  }
  return svgEl;
}
