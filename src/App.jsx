import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");

  function handleSearch(event) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      return;
    }

    setSearchedCity(trimmedCity);
    setCity("");
  }

  return (
    <main className="app">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Weather-based activity planning</p>

          <h1>Check the forecast before making outdoor plans.</h1>

          <p className="hero-description">
            PlanCast helps you look up weather conditions and decide whether the
            forecast is suitable for activities like walking, running, biking, or
            commuting.
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
            Enter a city to prepare the search flow. The next step will connect
            this form to live weather data.
          </p>
        </div>

        <div>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter a city, e.g. Toronto"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {searchedCity && (
            <div className="search-result">
              <p className="section-label">Selected city</p>
              <h3>{searchedCity}</h3>
              <p>
                Weather results for {searchedCity} will appear here once the API
                is connected.
              </p>
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