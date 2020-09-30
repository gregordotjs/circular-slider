//@ts-check
import { CIRCLE, MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP, SVG } from "./utils/consts";
import generateSVGElement from "./utils/generate-svg";

const defaults = {
  svgHeight: 400,
  svgWidth: 400,
  strokeWidth: 20,
  center: {
    x: 0,
    y: 0,
  },
};

/**
 *
 * @param {string} id
 * @returns Element
 */
const byId = (id) => document.getElementById(id);

export class CircularSlider {
  #color = "";
  #max = 0;
  #min = 0;
  #step = 0;
  #radius = 0;

  #isMouseDown = false;

  /** @type {(value: string) => void} */
  #handleChange = null;

  /**
   * Elements
   *
   */

  /** @type {Element} */
  #container = null;

  /** @type {Element} */
  #SVGContainer = null;

  /** @type {Element} */
  #circle = null;

  /** @type {Element} */
  #sliderHandle = null;

  /**
   * @param {{ container: string; color: string; max: number; step: number; radius: number; min?: number; onChange?: (value: string) => void; }} options
   */
  constructor(options) {
    const {
      container,
      color,
      max,
      min = 0,
      step,
      radius,
      onChange = null,
    } = options;
    if (onChange !== null) {
      this.#handleChange = onChange;
    }
    this.#container = byId(container);
    this.#color = color;
    this.#max = max;
    this.#min = min;
    this.#step = step;
    this.#radius = radius;
    this.#OnInit();
  }

  #OnInit = () => {
    this.#SVGContainer = byId("SVGContainer");

    // generate main SVG tag if it doesn't exist yet
    if (this.#SVGContainer === null) {
      // this is called only the first time, when SVG container doesn't exits yet
      const { width, height } = this.#container.getBoundingClientRect();

      this.#SVGContainer = generateSVGElement(
        {
          width: width || defaults.svgWidth,
          height: height || defaults.svgHeight,
          id: "SVGContainer",
          style: "border: 1px solid red",
        },
        SVG
      );
      this.#container.appendChild(this.#SVGContainer);
    }

    const {
      left,
      top,
      width,
      height,
    } = this.#SVGContainer.getBoundingClientRect();

    // calculate the center of the SVG container
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

    this.#circle.addEventListener(MOUSE_MOVE, this.#onMouseMove);
    this.#circle.addEventListener(MOUSE_UP, this.#onMouseDown);

    this.#sliderHandle.addEventListener(MOUSE_DOWN, this.#onMouseDown);
    this.#sliderHandle.addEventListener(MOUSE_UP, this.#onMouseDown);
    this.#sliderHandle.addEventListener(MOUSE_MOVE, this.#onMouseMove);
  };

  #onMouseDown = ({ type }) => {
    switch (type) {
      case MOUSE_DOWN:
        this.#isMouseDown = true;
        break;

      default:
        this.#isMouseDown = false;
        break;
    }
  };

  /**
   *
   * @param {MouseEvent} e
   */
  #onMouseMove = (e) => {
    if (!this.#isMouseDown) return;
    const { x, y, radians } = this.#calculateCoordinates(e.x, e.y);
    this.#sliderHandle.setAttribute("cx", x.toString());
    this.#sliderHandle.setAttribute("cy", y.toString());

    this.#handleChange(
      JSON.stringify({ x, y, r: radians, degrees: radians * (180 / Math.PI) })
    );
  };

  /**
   *
   * @param {number} x
   * @param {number} y
   * @returns {{x: number, y: number, radians: number}}
   */
  #calculateCoordinates = (x, y) => {
    // atan2 returns the angle in radians: https://math.stackexchange.com/questions/94379/calculating-angle-in-circle
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    let radians = Math.atan2(y - defaults.center.y, x - defaults.center.x);

    // calculate new coordinates based on angle: https://en.wikipedia.org/wiki/Circle#Equations
    return {
      radians,
      x: defaults.center.x + this.#radius * Math.cos(radians),
      y: defaults.center.y + this.#radius * Math.sin(radians),
    };
  };
}
