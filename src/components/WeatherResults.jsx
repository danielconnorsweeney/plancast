import ForecastList from "./ForecastList";
import RecommendationCard from "./RecommendationCard";

function WeatherResults({
  location,
  weather,
  weatherCondition,
  activityRecommendation,
  selectedActivity,
  activityOptions,
  dailyForecast,
}) {
  if (!location || !weather) {
    return null;
  }

  return (
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

      <ForecastList dailyForecast={dailyForecast} />
    </div>
  );
}

export default WeatherResults;
