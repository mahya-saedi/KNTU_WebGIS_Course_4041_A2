// Create map (OpenStreetMap base layer)
const map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([51.3890, 35.6892]), // Tehran
    zoom: 10,
  }),
});

// Just to test click coordinate (later we use it for Weather)
map.on("click", async function (evt) {
  const lonLat = ol.proj.toLonLat(evt.coordinate);
  const lon = lonLat[0];
  const lat = lonLat[1];

  const weatherBox = document.getElementById("weatherBox");
  weatherBox.classList.remove("hidden");
  weatherBox.innerHTML = "Loading weather...";

  try {
    const API_KEY = CONFIG.OPENWEATHER_KEY; // <-- later replace locally
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Weather API error");
    }

    const data = await response.json();

    weatherBox.innerHTML = `
      <h3>Weather</h3>
      <p><b>Temperature:</b> ${data.main.temp} °C</p>
      <p><b>Condition:</b> ${data.weather[0].description}</p>
      <p><b>Humidity:</b> ${data.main.humidity}%</p>
    `;
  } catch (error) {
    console.error(error);
    weatherBox.innerHTML = "Failed to load weather data";
  }
});

// ---- Geocoding (Search) ----
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value;
  if (!query) return alert("Please enter a place name");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await response.json();

    if (data.length === 0) {
      alert("Location not found");
      return;
    }

    const lon = parseFloat(data[0].lon);
    const lat = parseFloat(data[0].lat);

    map.getView().animate({
      center: ol.proj.fromLonLat([lon, lat]),
      zoom: 14,
      duration: 1500,
    });
  } catch (error) {
    console.error(error);
    alert("Error fetching location");
  }
});