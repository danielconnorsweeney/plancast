import "./App.css";

function App() {
  return (
    <main className="app">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Weather-based activity planning</p>

          <h1>Plan your day around the forecast.</h1>

          <p className="hero-description">
            PlanCast helps you check the weather, save favorite locations, and
            decide whether your outdoor activities are a good idea based on
            temperature, rain, and wind conditions.
          </p>

          <div className="hero-actions">
            <a href="#search" className="primary-button">
              Check the weather
            </a>
            <a href="#features" className="secondary-button">
              View features
            </a>
          </div>
        </div>

        <div className="weather-card" aria-label="Sample weather card">
          <div className="weather-card-header">
            <div>
              <p className="card-label">Today in Toronto</p>
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
            This search form will later connect to the Open-Meteo API so users
            can look up real weather forecasts.
          </p>
        </div>

        <form className="search-form">
          <input type="text" placeholder="Enter a city, e.g. Toronto" />
          <button type="submit">Search</button>
        </form>
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
