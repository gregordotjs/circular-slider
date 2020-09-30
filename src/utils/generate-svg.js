//@ts-check

import { SVG_NAMESPACE } from "./consts";

/**
 * Create a SVG element based on the attributes and type.
 * @param  {{[key: string]: string | number}} attributes
 * @param  {string} type
 * @return {Element} return a SVG element
 */
export default function generateSVGElement(attributes, type) {
  const svgEl = document.createElementNS(SVG_NAMESPACE, type);
  for (const key in attributes) {
    if (attributes[key] === undefined) console.log(key, attributes);
    svgEl.setAttributeNS(null, key, attributes[key].toString());
  }
  return svgEl;
}
