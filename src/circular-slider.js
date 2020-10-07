//@ts-check

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
  TOUCH_END,
  TOUCH_MOVE,
  TOUCH_START,
  SVG,
} from "./utils/consts";
import generateSVGElement from "./utils/generate-svg";
import {
  ValidateAndGetContainer,
  ValidateBoundary,
  ValidateExistingElements,
  ValidateProperties,
} from "./utils/validators";

const defaults = {
  strokeWidth: 40,
  handle: {
    strokeWidth: 10,
    radius: 20,
  },
  center: {
    x: 0,
    y: 0,
  },
};

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

    ValidateProperties(min, max, step);
    this.#container = ValidateAndGetContainer(container);
    ValidateExistingElements(radius);

    if (onChange !== null) {
      this.#handleChange = onChange;
    }

    this.#color = color;
    this.#max = max;
    this.#min = min;
    this.#step = step;
    this.#radius = radius;

    this.#OnInit();
  }

  #OnInit = () => {
    this.#SVGContainer = document.getElementById("SVGContainer");

    // generate main SVG tag if it doesn't exist yet
    if (this.#SVGContainer === null) {
      // this is called only the first time, when SVG container doesn't exits yet
      this.#SVGContainer = generateSVGElement(
        {
          width: "100%",
          height: "100%",
          id: "SVGContainer",
        },
        SVG
      );

      // Append SVG container to div (container)
      this.#container.appendChild(this.#SVGContainer);

      // calculate the center of the SVG container
      const { width, height } = this.#container.getBoundingClientRect();
      defaults.center = {
        x: width / 2,
        y: height / 2,
      };
    }

    const { width, height } = this.#SVGContainer.getBoundingClientRect();
    const { strokeWidth, radius } = defaults.handle;

    ValidateBoundary(
      width,
      height,
      this.#radius + strokeWidth + radius,
      this.#radius
    );

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

    this.#circle = generateSVGElement(
      { ...circleAttributes, class: "circle" },
      CIRCLE
    );

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
        r: defaults.handle.radius,
        fill: "white",
        stroke: "#888",
        ["stroke-width"]: defaults.handle.strokeWidth,
        style: "cursor: grab;",
      },
      CIRCLE
    );

    // append SVG elements to SVG container
    this.#SVGContainer.appendChild(this.#circle);
    this.#SVGContainer.appendChild(this.#progressCircle);
    this.#SVGContainer.appendChild(this.#sliderHandle);

    /**
     * Setting up events for SVG elements
     */

    // mouse events
    this.#sliderHandle.addEventListener(MOUSE_DOWN, this.#startSlide);
    //this.#sliderHandle.addEventListener(MOUSE_MOVE, this.#slide);
    this.#sliderHandle.addEventListener(MOUSE_UP, this.#endSlide);

    // touch events
    this.#sliderHandle.addEventListener(TOUCH_START, this.#startSlide);
    //this.#sliderHandle.addEventListener(TOUCH_MOVE, this.#slide);
    this.#sliderHandle.addEventListener(TOUCH_END, this.#endSlide);

    // click events
    this.#circle.addEventListener(CLICK, this.#click);
    this.#progressCircle.addEventListener(CLICK, this.#click);
   
    // fixed issues with touchmove
    this.#container.addEventListener(TOUCH_MOVE, this.#slide);
    this.#container.addEventListener(MOUSE_MOVE, this.#slide);

    // fixed issues if mouseup performed outside the circle
    window.document.addEventListener(MOUSE_UP, this.#dropOutside);
    window.document.addEventListener(TOUCH_END, this.#dropOutside);

    this.#emit(this.#min);
  };

  // HANDLERS OF MOUSE EVENTS

  /**
   * @param {MouseEvent} e
   */
  #startSlide = (e) => {
    if (e.type !== TOUCH_START) {
      e.preventDefault();
    }
    this.#sliderHandle.setAttribute("style", "cursor: grabbing");
    this.#isMouseDown = true;
  };

  /**
   * @param {MouseEvent} e
   */
  #endSlide = (e) => {
    this.#sliderHandle.setAttribute("style", "cursor: grab");
    this.#isMouseDown = false;
  };

  /**
   * @param {MouseEvent} e
   */
  #click = (e) => {
    this.#sliderHandle.setAttribute("style", "cursor: grab");
    this.#isMouseDown = false;
    this.#handleSlide(e);
  };

  #dropOutside = () => {
    this.#sliderHandle.setAttribute("style", "cursor: grab");
    this.#isMouseDown = false;
    const { x, y } = this.#lastMousePosition;
    if (x !== null && y !== null) {
      this.#handleSlide({ pageX: x, pageY: y });
      this.#lastMousePosition.x = null;
      this.#lastMousePosition.y = null;
    }
  };

  /**
   * @param {MouseEvent} e
   */
  #slide = (e) => {
    if (!this.#isMouseDown) return;
    e.preventDefault();
    this.#handleSlide(e);
  };

  // METHODS

  /**
   * @param {{ pageX: number; pageY: number; type?: string; changedTouches?: any; }} e
   */
  #handleSlide = ({ pageX, pageY, type, changedTouches }) => {
    if (type === TOUCH_MOVE || type === TOUCH_END) {
      pageX = changedTouches[0].pageX;
      pageY = changedTouches[0].pageY;
    }

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
        this.#emit(this.#min + this.#step * index);
        break;
      }

      if (degrees > min && degrees > divider && degrees < max) {
        if (!this.#isMouseDown) {
          radians = toRadians(max - tilt);
        }
        this.#emit(this.#min + this.#step * index);
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
  #emit = (value) => {
    if (this.#handleChange !== null) {
      this.#handleChange(value);
    }
  };
}
