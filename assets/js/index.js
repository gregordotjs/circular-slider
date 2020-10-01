//@ts-check

/**
 * @param {any} cssSelector
 * @returns {HTMLElement}
 */
const query = (cssSelector) => document.querySelector(cssSelector);

/**
 * @param {string} cssSelector
 * @param {number} value
 * @param {string} units
 */
const displayValue = (cssSelector, value, units) =>
  (query(cssSelector).innerHTML = `${value} ${units}`);

const color1 = "blue";
const color2 = "green";
const color3 = "black";

query("#spinner1Results > div").style.backgroundColor = color1;
query("#spinner2Results > div").style.backgroundColor = color2;
query("#spinner3Results > div").style.backgroundColor = color3;

// @ts-ignore
new CircularSlider({
  container: "sliders",
  color: color1,
  max: 270,
  min: 0,
  step: 54,
  radius: 200,
  onChange: (data) => {
    displayValue("#spinner1Results > span", data, "steps");
  },
});

// @ts-ignore
new CircularSlider({
  container: "sliders",
  color: color2,
  max: 4,
  min: 0,
  step: 1,
  radius: 140,
  onChange: (data) => {
    displayValue("#spinner2Results > span", data, "&euro;");
  },
});

// @ts-ignore
new CircularSlider({
  container: "sliders",
  color: color3,
  max: 1000,
  min: 250,
  step: 250,
  radius: 60,
  onChange: (data) => {
    displayValue("#spinner3Results > span", data, "minutes");
  },
});
