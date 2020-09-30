import { CIRCLE, SVG, generateSVGElement } from "./utils/generate-svg";

const defaults = {
  svgHeight: 400,
  svgWidth: 400,
  strokeWidth: 20,
};

const byId = (id) => document.getElementById(id);

export class CircularSlider {
  /** @type {string} */
  #color = "";

  /** @type {number} */
  #max = 0;

  /** @type {number} */
  #min = 0;

  /** @type {number} */
  #step = 0;

  /** @type {number} */
  #radius = 0;

  /** @type {(data) => {}} */
  #handleChange = null;

  /**
   * Elements
   *
   */

  /** @type {Element} */
  #container = null;

  /** @type {SVGElement} */
  #SVGContainer = null;

  /** @type {SVGElement} */
  #circle = null;

  constructor(options) {
    const { container, color, max, min, step, radius, onChange } = options;
    if (onChange) {
      this.#handleChange = onChange;
    }
    this.#container = byId(container);
    this.#color = color;
    this.#max = max;
    this.#min = min;
    this.#step = step;
    this.#radius = radius;
    this.radius = radius;
    this.OnInit();
  }

  OnInit() {
    this.#SVGContainer = byId("SVGContainer");
    if (this.#SVGContainer === null) {
      // generate main SVG tag if it doesn't exist yet
      this.#SVGContainer = generateSVGElement(
        {
          width: defaults.svgWidth,
          height: defaults.svgHeight,
          id: "SVGContainer",
        },
        SVG
      );
      this.#container.appendChild(this.#SVGContainer);
    }

    this.#circle = generateSVGElement(
      {
        cx: 150,
        cy: 150,
        r: this.#radius,
        fill: "none",
        stroke: "#dadada",
        ["stroke-width"]: defaults.strokeWidth,
        style: "cursor: pointer;",
      },
      CIRCLE
    );
    this.#SVGContainer.appendChild(this.#circle);

    this.#circle.addEventListener("mousemove", ({ x, y }) => {
      this.#handleChange(JSON.stringify({ x, y }));
    });
  }
}
