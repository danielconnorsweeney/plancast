import { useState } from "react";
import RecommendationCard from "./components/RecommendationCard";
import SearchForm from "./components/SearchForm";
import "./App.css";

function getWeatherCondition(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
  };

  return weatherCodes[code] || "Weather data unavailable";
}

const activityOptions = {
  walking: {
    label: "Walking",
    minTemp: 0,
    maxTemp: 30,
    maxWind: 30,
  },
  running: {
    label: "Running",
    minTemp: 5,
    maxTemp: 24,
    maxWind: 25,
  },
  biking: {
    label: "Biking",
    minTemp: 8,
    maxTemp: 26,
    maxWind: 22,
  },
  commuting: {
    label: "Commuting",
    minTemp: 8,
    maxTemp: 26,
    maxWind: 22,
  },
  studyingOutside: {
    label: "Studying outside",
    minTemp: 15,
    maxTemp: 27,
    maxWind: 18,
  }
};

function getActivityRecommendation(weather, activityKey) {
  if (!weather) {
    return null;
  }
  const activity = activityOptions[activityKey];

  let score = 100;

  const reasons = [];

  if (activityKey === "running" && weather.temperature_2m > 30) {
    score -= 50;
    reasons.push("Temperature is very high for running.");
  }
  else if (
    weather.temperature_2m < activity.minTemp ||
    weather.temperature_2m > activity.maxTemp
  ) {
    score -= 25;
    reasons.push("Temperature is outside the ideal range for this activity.");
  } else {
    reasons.push("Temperature is suitable for this activity.");
  }
  

  const rainyWeatherCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95];

  if (
    weather.precipitation > 0 ||
    weather.rain > 0 ||
    weather.showers > 0 ||
    rainyWeatherCodes.includes(weather.weather_code)
  ) {
    score -= 30;
    reasons.push("Rain or wet conditions may affect this activity.");
  } else {
    reasons.push("No active rain is currently reported.");
  }

  if (weather.wind_speed_10m > activity.maxWind) {
    score -= 20;
    reasons.push("Wind speed is higher than recommended for this activity.");
  } else {
    reasons.push("Wind speed is acceptable for this activity.");
  }

  if (score >= 80) {
    return {
      score,
      label: `Good for ${activity.label.toLowerCase()}`,
      reasons,
    };
  }

  if (score >= 60) {
    return {
      score,
      label: `Okay for ${activity.label.toLowerCase()}`,
      reasons,
    };
  }

  return {
    score,
    label: `Not ideal for ${activity.label.toLowerCase()}`,
    reasons,
  };
}

function App() {
  const [city, setCity] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("walking");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const activityRecommendation = getActivityRecommendation(
    weather,
    selectedActivity
  );
  
  
  const weatherCondition = weather
    ? getWeatherCondition(weather.weather_code)
    : "";

  async function handleSearch(event) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setStatusMessage("Please enter a city name.");
      setLocation(null);
      setWeather(null);
      setDailyForecast([]);
      return;
    }

    try {
      setStatusMessage("Searching for city...");
      setLocation(null);
      setWeather(null);
      setDailyForecast([]);

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
        `https://api.open-meteo.com/v1/forecast?latitude=${firstResult.latitude}&longitude=${firstResult.longitude}&current=temperature_2m,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=5`,
      );

      if (!weatherResponse.ok) {
        throw new Error("Weather request failed.");
      }

      const weatherData = await weatherResponse.json();

      const formattedDailyForecast = weatherData.daily.time.map((date, index) => ({
        date,
        condition: getWeatherCondition(weatherData.daily.weather_code[index]),
        high: Math.round(weatherData.daily.temperature_2m_max[index]),
        low: Math.round(weatherData.daily.temperature_2m_min[index]),
        precipitation: weatherData.daily.precipitation_sum[index],
        precipitationChance: weatherData.daily.precipitation_probability_max[index],
      }));

      setLocation(firstResult);
      setWeather(weatherData.current);
      setDailyForecast(formattedDailyForecast);
      setStatusMessage("");
      setCity("");
    } catch  {
      setStatusMessage(
        "Something went wrong while searching. Please try again.",
      );
      setLocation(null);
      setWeather(null);
      setDailyForecast([]);
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
          <SearchForm
            city={city}
            selectedActivity={selectedActivity}
            activityOptions={activityOptions}
            onCityChange={setCity}
            onActivityChange={setSelectedActivity}
            onSubmit={handleSearch}
          />

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
                  <p className="weather-condition">{weatherCondition}</p>
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
                  <span>Condition</span>
                  <strong>{weatherCondition}</strong>
                </div>

                <div>
                  <span>Precipitation</span>
                  <strong>{weather.precipitation} mm</strong>
                </div>

                <div>
                  <span>Rain</span>
                  <strong>{weather.rain} mm</strong>
                </div>

                <div>
                  <span>Wind</span>
                  <strong>{Math.round(weather.wind_speed_10m)} km/h</strong>
                </div>
              </div>

              <RecommendationCard
                activityRecommendation={activityRecommendation}
                selectedActivity={selectedActivity}
                activityOptions={activityOptions}
              />

              {dailyForecast.length > 0 && (
                <div className="forecast-section">
                  <p className="section-label">5-day forecast</p>

                  <div className="forecast-grid">
                    {dailyForecast.map((day) => (
                      <article className="forecast-card" key={day.date}>
                        <h4>
                          {new Date(`${day.date}T00:00`).toLocaleDateString(
                            "en-CA",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </h4>
                        <p>{day.condition}</p>
                        <div>
                          <span>High</span>
                          <strong>{day.high}°C</strong>
                        </div>
                        <div>
                          <span>Low</span>
                          <strong>{day.low}°C</strong>
                        </div>
                        <div>
                          <span>Rain chance</span>
                          <strong>{day.precipitationChance}%</strong>
                        </div>
                        <div>
                          <span>Precipitation</span>
                          <strong>{day.precipitation} mm</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
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
