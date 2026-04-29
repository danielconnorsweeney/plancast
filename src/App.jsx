import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setStatusMessage("Please enter a city name.");
      setLocation(null);
      setWeather(null);
      return;
    }

    try {
      setStatusMessage("Searching for city...");
      setLocation(null);
      setWeather(null);

      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmedCity,
        )}&count=1&language=en&format=json`,
      );

      if (!locationResponse.ok) {
        throw new Error("City search failed.");
      }

      const locationData = await locationResponse.json();
      const firstResult = locationData.results?.[0];

      if (!firstResult) {
        setStatusMessage("No city found. Try a larger nearby city.");
        return;
      }

      setStatusMessage("Loading weather data...");

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${firstResult.latitude}&longitude=${firstResult.longitude}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`,
      );

      if (!weatherResponse.ok) {
        throw new Error("Weather request failed.");
      }

      const weatherData = await weatherResponse.json();

      setLocation(firstResult);
      setWeather(weatherData.current);
      setStatusMessage("");
      setCity("");
    } catch (error) {
      setStatusMessage(
        "Something went wrong while searching. Please try again.",
      );
      setLocation(null);
      setWeather(null);
    }
  }

  return (
    <main className="app">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Weather-based activity planning</p>

          <h1>Check the forecast before making outdoor plans.</h1>

          <p className="hero-description">
            PlanCast helps you look up weather conditions and decide whether the
            forecast is suitable for activities like walking, running, biking,
            or commuting.
          </p>

          <div className="hero-actions">
            <a href="#search" className="primary-button">
              Search a city
            </a>
            <a href="#features" className="secondary-button">
              View features
            </a>
          </div>
        </div>

        <div className="weather-card" aria-label="Sample weather card">
          <div className="weather-card-header">
            <div>
              <p className="card-label">Example forecast</p>
              <h2>18°C</h2>
            </div>
            <span className="weather-badge">Good for walking</span>
          </div>

          <div className="weather-details">
            <div>
              <span>Rain</span>
              <strong>10%</strong>
            </div>
            <div>
              <span>Wind</span>
              <strong>14 km/h</strong>
            </div>
            <div>
              <span>Score</span>
              <strong>86/100</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section" id="search">
        <div>
          <p className="section-label">City search</p>
          <h2>Start with a location</h2>
          <p>
            Enter a city to find its location details and view current weather
            conditions.
          </p>
        </div>

        <div>
          <form className="search-form" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="city-search">
              City
            </label>

            <input
              id="city-search"
              name="city"
              type="text"
              placeholder="Enter a city, e.g. Toronto"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          {statusMessage && <p className="status-message">{statusMessage}</p>}

          {location && weather && (
            <div className="search-result">
              <p className="section-label">Current weather</p>

              <div className="result-header">
                <div>
                  <h3>
                    {location.name}
                    {location.admin1 ? `, ${location.admin1}` : ""}
                  </h3>
                  <p>{location.country}</p>
                </div>

                <strong className="current-temp">
                  {Math.round(weather.temperature_2m)}°C
                </strong>
              </div>

              <div className="location-details">
                <div>
                  <span>Latitude</span>
                  <strong>{location.latitude}</strong>
                </div>
                <div>
                  <span>Longitude</span>
                  <strong>{location.longitude}</strong>
                </div>
                <div>
                  <span>Rain</span>
                  <strong>{weather.precipitation} mm</strong>
                </div>
                <div>
                  <span>Wind</span>
                  <strong>{Math.round(weather.wind_speed_10m)} km/h</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="features" id="features">
        <article>
          <h3>Live weather data</h3>
          <p>
            Search cities and view current weather, forecast details, rain, and
            wind conditions.
          </p>
        </article>

        <article>
          <h3>Activity recommendations</h3>
          <p>
            Get a simple score that helps decide if the weather is suitable for
            running, walking, biking, commuting, or studying outside.
          </p>
        </article>

        <article>
          <h3>Saved plans</h3>
          <p>
            Later, users will be able to save favorite cities and activity plans
            to a database.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;
