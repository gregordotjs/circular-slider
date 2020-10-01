//@ts-check

// TODO:
  // - mobile
  // - default values?

import {
  screenToSVGCoordinates,
  toDegrees,
  toRadians,
} from "./utils/transformations";
import {
  CIRCLE,
  CLICK,
  MOUSE_DOWN,
  MOUSE_MOVE,
  MOUSE_UP,
  SVG,
} from "./utils/consts";
import generateSVGElement from "./utils/generate-svg";

const defaults = {
  svgHeight: 400,
  svgWidth: 400,
  strokeWidth: 40,
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
  #circumference = 0;

  #isMouseDown = false;
  #lastMousePosition = {
    x: null,
    y: null,
  };

  /** @type {(value: number) => void | null} */
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
  #progressCircle = null;

  /** @type {Element} */
  #sliderHandle = null;

  /**
   * @param {{ container: string; color: string; max: number; step: number; radius: number; min?: number; onChange?: (value: number) => void; }} options
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
    if ((max - min) % step !== 0)
      throw new Error(
        `Can't achieve full circle with given props: min ${min}, max ${max} and step ${step}`
      );

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

      // Append SVG container to div (container)
      this.#container.appendChild(this.#SVGContainer);
    }

    const { width, height } = this.#SVGContainer.getBoundingClientRect();

    // calculate the center of the SVG container
    defaults.center = {
      x: width / 2,
      y: height / 2,
    };
    const { x, y } = defaults.center;
    const circleAttributes = {
      cx: x,
      cy: y,
      r: this.#radius,
      fill: "none",
      stroke: "#dadada",
      ["stroke-width"]: defaults.strokeWidth,
      style: "cursor: pointer;",
    };

    this.#circle = generateSVGElement(circleAttributes, CIRCLE);

    // stroke-dasharray: dash-length, gap-length
    // "hides" the progress circle
    this.#circumference = Math.round(2 * Math.PI * this.#radius);
    this.#progressCircle = generateSVGElement(
      {
        ...circleAttributes,
        ["stroke-dasharray"]: this.#circumference,
        ["stroke-dashoffset"]: this.#circumference,
        style: `transform: rotate(-90deg); transform-origin: ${x}px ${y}px; transition: stroke-dashoffset 0.40s; cursor: pointer;`,
        stroke: this.#color,
      },
      CIRCLE
    );

    this.#sliderHandle = generateSVGElement(
      {
        cx: x,
        cy: y - this.#radius,
        r: 20,
        fill: "white",
        stroke: "#888",
        ["stroke-width"]: 10,
        style: "cursor: grab;",
      },
      CIRCLE
    );

    // append SVG elements to SVG container
    this.#SVGContainer.appendChild(this.#circle);
    this.#SVGContainer.appendChild(this.#progressCircle);
    this.#SVGContainer.appendChild(this.#sliderHandle);

    // Setting up events for SVG elements
    this.#sliderHandle.addEventListener(MOUSE_DOWN, this.#onMouseDown);
    this.#sliderHandle.addEventListener(MOUSE_MOVE, this.#onMouseMove);
    this.#sliderHandle.addEventListener(MOUSE_UP, this.#onClick);
    this.#circle.addEventListener(CLICK, this.#onClick);
    this.#progressCircle.addEventListener(CLICK, this.#onClick);

    window.document.addEventListener(MOUSE_UP, (_) => {
      this.#sliderHandle.setAttribute("style", "cursor: grab");
      this.#isMouseDown = false;
      const { x, y } = this.#lastMousePosition;
      if (x !== null && y !== null) this.#slide({ pageX: x, pageY: y });
    });
  };

  /**
   * @param {MouseEvent} e
   */
  #onClick = (e) => {
    this.#sliderHandle.setAttribute("style", "cursor: grab");
    this.#isMouseDown = false;
    this.#slide(e);
  };

  /**
   * @param {MouseEvent} e
   */
  #onMouseDown = (e) => {
    e.preventDefault();
    this.#sliderHandle.setAttribute("style", "cursor: grabbing");
    this.#isMouseDown = true;
  };

  /**
   * @param {MouseEvent} e
   */
  #onMouseUp = (e) => {};

  /**
   * @param {MouseEvent} e
   */
  #onMouseMove = (e) => {
    if (!this.#isMouseDown) return;
    this.#slide(e);
  };

  #slide = ({ pageX, pageY }) => {
    this.#lastMousePosition.x = pageX;
    this.#lastMousePosition.y = pageY;

    const pt = screenToSVGCoordinates(this.#SVGContainer, pageX, pageY);
    const { x, y, percentage, radians, degrees } = this.#calculateCoordinates(
      pt.x,
      pt.y
    );
    this.#sliderHandle.setAttribute("cx", x.toString());
    this.#sliderHandle.setAttribute("cy", y.toString());
    this.#moveProgressCircle(percentage);
  };

  /**
   *
   * @param {number} x
   * @param {number} y
   * @returns {{x: number, y: number, percentage: number, radians: number, degrees: number}}
   */
  #calculateCoordinates = (x, y) => {
    // atan2 returns the angle in radians: https://math.stackexchange.com/questions/94379/calculating-angle-in-circle
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    let radians = Math.atan2(y - defaults.center.y, x - defaults.center.x);
    let degrees = toDegrees(radians);
    let tilt = degrees < -90 ? 450 : 90;
    degrees += tilt;

    // calculate the number of steps
    const steps = (this.#max - this.#min) / this.#step;

    // get a single step in degrees
    const stepInDegrees = 360 / steps;

    let startDegrees = 0;
    let index = 1;

    // go through all possible steps and identify where the current mouse position is
    for (let i = 1; i <= steps; i++) {
      let min = startDegrees;
      let max = startDegrees + stepInDegrees;

      // introduced a divider; less than the divider is min value, more is max
      const divider = (min + max) / 2;

      if (degrees >= min && degrees <= divider) {
        // this will force the progress circle to "snap back" if degrees are less than the divider
        index--;

        // this will force the slide handler to "snap" to the nearest step
        if (!this.#isMouseDown) {
          radians = toRadians(min - tilt);
        }
        this.#onChange(this.#min + this.#step * index);
        break;
      }

      if (degrees > min && degrees > divider && degrees < max) {
        if (!this.#isMouseDown) {
          radians = toRadians(max - tilt);
        }
        this.#onChange(this.#min + this.#step * index);
        break;
      }
      index++;
      startDegrees += stepInDegrees;
    }

    // calculate new coordinates based on angle: https://en.wikipedia.org/wiki/Circle#Equations
    return {
      radians,
      degrees,
      percentage: index / steps,
      x: defaults.center.x + this.#radius * Math.cos(radians),
      y: defaults.center.y + this.#radius * Math.sin(radians),
    };
  };

  /**
   * @param {number} percentage
   */
  #moveProgressCircle = (percentage) => {
    let offset = this.#circumference - percentage * this.#circumference;
    this.#progressCircle.setAttribute("stroke-dashoffset", offset.toString());
  };

  /**
   * @param {number} value
   */
  #onChange = (value) => {
    if (this.#handleChange !== null) {
      this.#handleChange(value);
    }
  };
}
