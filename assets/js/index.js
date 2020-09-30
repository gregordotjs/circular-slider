new CircularSlider({
  container: "sliders",
  color: "blue",
  max: 4,
  min: 0,
  step: 1,
  radius: 120,
  onChange: (data) => {
    document.getElementById("spinner1Results").textContent = data;
  },
});

new CircularSlider({
  container: "sliders",
  color: "green",
  max: 4,
  min: 0,
  step: 1,
  radius: 60,
  onChange: (data) => {
    document.getElementById("spinner2Results").textContent = data;
  },
});
