// @ts-check

/**
 * @param {number} min
 * @param {number} max
 * @param {number} step
 */
export function ValidateProperties(min, max, step) {
  if (step > max)
    throw new Error(`Step ${step} can't be greater than max ${max}`);
  if (min > max) throw new Error(`Min ${min} can't be greater than max ${max}`);
  if ((max - min) % step !== 0)
    throw new Error(
      `Can't achieve full circle with given props: min ${min}, max ${max} and step ${step}`
    );
}

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
export function ValidateAndGetContainer(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Container with ID ${id} doesn't exist!`);
  }
  return el;
}

/**
 * @param {number} currentRadius
 */
export function ValidateExistingElements(currentRadius) {
  /** @type {NodeListOf<Element>} */
  const circles = document.querySelectorAll(".circle");
  for (const circle of circles) {
    const r = parseInt(circle.getAttribute("r"));
    if (Math.abs(r - currentRadius) < 60) {
      throw new Error(
        `Circles are too close (current: ${currentRadius}, existing: ${r})`
      );
    }
  }
}

/**
 * @param {number} conatinerWidth
 * @param {number} containerHeight
 * @param {number} limit
 * @param {number} radius
 */
export function ValidateBoundary(
  conatinerWidth,
  containerHeight,
  limit,
  radius
) {
  if (conatinerWidth / 2 < limit || containerHeight / 2 < limit) {
    throw new Error(
      `Circle is out of bounds. r: ${radius}, container width: ${conatinerWidth}, container height: ${containerHeight}`
    );
  }
}
