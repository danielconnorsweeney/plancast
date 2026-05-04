import { useEffect, useState } from "react";
import WeatherResults from "./components/WeatherResults";
import SearchForm from "./components/SearchForm";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RECENT_SEARCHES_STORAGE_KEY = "plancastRecentSearches";

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
  const [recentSearches, setRecentSearches] = useState(() => {
    const savedSearches = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);

    return savedSearches ? JSON.parse(savedSearches) : [];
  });
  const [savedCities, setSavedCities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("walking");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [backendStatus, setBackendStatus] = useState("Checking backend...");

  useEffect(() => {
    loadSavedCities();
  }, []);

  const activityRecommendation = getActivityRecommendation(
    weather,
    selectedActivity
  );
  
  
  const weatherCondition = weather
    ? getWeatherCondition(weather.weather_code)
    : "";

    async function checkBackendStatus(){
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);

        if (!response.ok) {
          throw new Error("Backend health check failed.");
        }

        const data = await response.json();
        setBackendStatus(data.message);
      } catch {
        setBackendStatus("Backend is not conncted.");
      }
    }

    async function loadSavedCities() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/saved-cities`);

        if (!response.ok) {
          throw new Error ("Saved cities request failed.");
        }

        const data = await response.json();
        setSavedCities(data);
      } catch {
        setStatusMessage("Unable to load saved cities. Please try again later.");
      }
    }

    async function saveCurrentCity() {
      if (!location) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/saved-cities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: location.name,
            admin1: location.admin1,
            country: location.country,
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        }); 

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to save this city");
        }

        await loadSavedCities();
        setStatusMessage("City saved");
      } catch (error) {
        setStatusMessage(error.message);
      }
    }

    async function loadWeatherForLocation(locationResult) {
      setStatusMessage("Loading weather data...");
      setLocation(null);
      setWeather(null);
      setDailyForecast([]);

      const weatherResponse = await fetch(
        `${API_BASE_URL}/api/weather?latitude=${locationResult.latitude}&longitude=${locationResult.longitude}`,
      );

      if (!weatherResponse.ok) {
        throw new Error("Weather request failed.");
      }

      const weatherData = await weatherResponse.json();

      const formattedDailyForecast = weatherData.daily.time.map(
        (date, index) => ({
          date,
          condition: getWeatherCondition(weatherData.daily.weather_code[index]),
          high: Math.round(weatherData.daily.temperature_2m_max[index]),
          low: Math.round(weatherData.daily.temperature_2m_min[index]),
          precipitation: weatherData.daily.precipitation_sum[index],
          precipitationChance:
            weatherData.daily.precipitation_probability_max[index],
        }),
      );

      setLocation(locationResult);
      setWeather(weatherData.current);
      setDailyForecast(formattedDailyForecast);
      setStatusMessage("");
    }

    function saveRecentSearch(locationResult) {
      const searchLabel = locationResult.admin1
        ? `${locationResult.name}, ${locationResult.admin1}`
        : locationResult.name;

      setRecentSearches((currentSearches) => {
        const filteredSearches = currentSearches.filter(
          (search) => search.label !== searchLabel,
        );

        const updatedSearches = [
          {
            label: searchLabel,
            name: locationResult.name,
            latitude: locationResult.latitude,
            longitude: locationResult.longitude,
            admin1: locationResult.admin1,
            country: locationResult.country,
          },
          ...filteredSearches,
        ].slice(0, 5);

        localStorage.setItem(
          RECENT_SEARCHES_STORAGE_KEY,
          JSON.stringify(updatedSearches),
        );

        return updatedSearches;
      });
    }

    async function handleRecentSearch(savedSearch) {
      try {
        await loadWeatherForLocation(savedSearch);
        saveRecentSearch(savedSearch);
        setCity("");
      } catch {
        setStatusMessage("Something went wrong while loading this saved city.");
        setLocation(null);
        setWeather(null);
        setDailyForecast([]);
      }
    }

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
        `${API_BASE_URL}/api/geocode?city=${encodeURIComponent(trimmedCity)}`,
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

      await loadWeatherForLocation(firstResult);
      saveRecentSearch(firstResult);
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
            <button
              type="button"
              className="secondary-button"
              onClick={checkBackendStatus}
              >
                Check backend
              </button>
          </div>

          <p className="backend-status">{backendStatus}</p>
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

          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <p className="section-label">Recent searches</p>

              <div className="recent-search-list">
                {recentSearches.map((search) => (
                  <button
                    key={search.label}
                    type="button"
                    onClick={() => handleRecentSearch(search)}
                  >
                    {search.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedCities.length > 0 && (
            <div className="saved-cities">
              <p className="section-label">Saved cities</p>

              <div className="recent-search-list">
                {savedCities.map((savedCity) => (
                  <button
                    key={savedCity.id}
                    type="button"
                    onClick={() => handleRecentSearch(savedCity)}
                    >
                      {savedCity.label}
                    </button>
                ))}
              </div>
              </div>
          )}

          {statusMessage && <p className="status-message">{statusMessage}</p>}

          <WeatherResults
            location={location}
            weather={weather}
            weatherCondition={weatherCondition}
            activityRecommendation={activityRecommendation}
            selectedActivity={selectedActivity}
            activityOptions={activityOptions}
            dailyForecast={dailyForecast}
            onSaveCity={saveCurrentCity}
          />
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
