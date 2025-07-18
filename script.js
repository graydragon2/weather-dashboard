const apiKey = 'c919ee46a3fd7c915bb483bf119861b4';
const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');

form.addEventListener('submit', e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
    cityInput.value = '';
  }
});

async function getWeather(city) {
  // Fetch current weather
  const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  const currentRes = await fetch(currentURL);
  if (!currentRes.ok) {
    currentEl.innerHTML = `<p>City not found. Try again.</p>`;
    forecastEl.innerHTML = '';
    return;
  }
  const currentData = await currentRes.json();
  renderCurrent(currentData);

  // Fetch 5-day / 3-hour forecast, then pick one data point per day
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  const forecastRes = await fetch(forecastURL);
  const forecastData = await forecastRes.json();
  renderForecast(forecastData);
}

function renderCurrent(data) {
  const { name, main: { temp, humidity }, wind: { speed }, weather } = data;
  const icon = weather[0].icon;
  currentEl.innerHTML = `
    <h2>${name} — Today</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weather[0].description}" />
    <p>Temp: ${temp.toFixed(1)}°C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind: ${speed} m/s</p>
  `;
}

function renderForecast(data) {
  // Group by date, pick one reading per day at midday if possible
  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date] && item.dt_txt.includes('12:00:00')) {
      daily[date] = item;
    }
  });

  forecastEl.innerHTML = '';
  Object.entries(daily).slice(0, 5).forEach(([date, item]) => {
    const { main: { temp }, weather } = item;
    const icon = weather[0].icon;
    forecastEl.innerHTML += `
      <div class="card">
        <h3>${new Date(date).toLocaleDateString()}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="" />
        <p>${temp.toFixed(1)}°C</p>
      </div>
    `;
  });
}