import { CIRCLE, SVG, generateSVGElement } from "./utils/generate-svg";

const defaults = {
  svgHeight: 400,
  svgWidth: 400,
  strokeWidth: 20,
  center: {
    x: 0,
    y: 0,
  },
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

  /** @type {SVGElement} */
  #sliderHandle = null;

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

    // calculate the center of the container
    const {
      left,
      top,
      width,
      height,
    } = this.#SVGContainer.getBoundingClientRect();
    defaults.center = {
      x: left + width / 2,
      y: top + height / 2,
    };

    this.#circle = generateSVGElement(
      {
        cx: defaults.center.x,
        cy: defaults.center.y,
        r: this.#radius,
        fill: "none",
        stroke: "#dadada",
        ["stroke-width"]: defaults.strokeWidth,
        style: "cursor: pointer;",
      },
      CIRCLE
    );

    this.#sliderHandle = generateSVGElement(
      {
        cx: defaults.center.x,
        cy: defaults.center.y - this.#radius,
        r: 7,
        fill: "none",
        stroke: "black",
        ["stroke-width"]: defaults.strokeWidth / 2,
        style: "cursor: pointer;",
      },
      CIRCLE
    );

    this.#SVGContainer.appendChild(this.#circle);
    this.#SVGContainer.appendChild(this.#sliderHandle);

    this.#circle.addEventListener("mousemove", this.onMouseMove);
    this.#sliderHandle.addEventListener("mousemove", this.onMouseMove);
  }

  onMouseMove = ({ x, y }) => {
    // atan2 returns the angle in radians: https://math.stackexchange.com/questions/94379/calculating-angle-in-circle
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    let radians = Math.atan2(y - defaults.center.y, x - defaults.center.x);

    // If radians are negative, 2 * PI is added https://stackoverflow.com/a/10343477
    radians = radians < 0 ? (radians += 2 * Math.PI) : radians;
    
    this.#handleChange(
      JSON.stringify({ x, y, r: radians, degrees: radians * (180 / Math.PI) })
    );
  };
}
