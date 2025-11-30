async function getWeather() {
  const city = document.getElementById("city").value;
  const result = document.getElementById("result");

  const apiKey = "https://api.open-meteo.com/v1/forecast?latitude=41.33&longitude=19.82&current_weather=true";

  const data = await fetch(apiKey);
  const json = await data.json();

  result.innerHTML = `
    <h2>${city}</h2>
    <p>Temperature: ${json.current_weather.temperature}°C</p>
    <p>Wind: ${json.current_weather.windspeed} km/h</p>
  `;
}
