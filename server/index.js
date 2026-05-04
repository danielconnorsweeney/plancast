/*  global process */
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
let savedCities = [];

app.use(
    cors({
        origin: CLIENT_URL,
    }),
);
app.use(express.json());

app.get("/", (request, response) => {
    response.send("PlanCast API is running");
});

app.get("/api/health", (request, response) => {
    response.json({
        status: "ok",
        message: "PlanCast backend is running",
    });
});

app.get("/api/saved-cities", (request, response) => {
    response.json(savedCities);
});

app.post("/api/saved-cities", (request, response) => {
    const { name, admin1, country, latitude, longitude } = request.body;

    if (!name || !country || !latitude || !longitude) {
        return response.status(400).json({
            message: "City name, country, latitude, and longitude are required",
        });
    }

    const cityLabel = [name, admin1, country].filter(Boolean).join(", ");

    const cityAlreadySaved = savedCities.some((city) => city.label === cityLabel);

    if (cityAlreadySaved) {
        return response.status(409).json({
            message: "City is already saved.",
        });
    }

    const newCity = {
        id: crypto.randomUUID(),
        label: cityLabel,
        name,
        admin1,
        country,
        latitude,
        longitude,
    };

    savedCities.unshift(newCity);

    response.status(201).json(newCity);
});

app.delete("/api/saved-cities/:id", (request, response) => {
  const { id } = request.params;

  const cityExists = savedCities.some((city) => city.id === id);

  if (!cityExists) {
    return response.status(404).json({
      message: "Saved city not found.",
    });
  }

  savedCities = savedCities.filter((city) => city.id !== id);

  response.status(204).send();
});

app.get("/api/geocode", async (request, response) => {
    const { city } = request.query;

    if (!city) {
        return response.status(400).json({
            message: "City name is required",
        });
    }

    try {
        const geocodeResponse = await fetch(
           `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city,
      )}&count=1&language=en&format=json`,  
    );

    if (!geocodeResponse.ok) {
        throw new Error("Open-Meteo geocoding request failed.");
    }

    const geocodeData = await geocodeResponse.json();

    response.json(geocodeData);
    } catch {
        response.status(500).json({
            message: "Unable to search for that city.",
        });
    }
});

app.get("/api/weather", async (request, response) => {
    const { latitude, longitude } = request.query;

    if (!latitude || !longitude) {
        return response.status(400).json({
            message: "Latitude and longitude are required",
        });
    }

    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=5`,
        );

        if (!weatherResponse.ok) {
            throw new Error("Open-Meteo weather request failed.");
        }

        const weatherData = await weatherResponse.json();

        response.json(weatherData);
    }   catch {
        response.status(500).json({
            message: "Unable to load weather data.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});