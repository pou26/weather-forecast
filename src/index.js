const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const weatherCardsDiv = document.querySelector(".forecast-slides");
const locationName = document.querySelector(".location-header");
const currentDate= document.querySelector(".date");
const temperatureDiv = document.querySelector(".temperature");
const weatherImage = document.querySelector(".image");
const temperatureTextDiv = document.querySelector(".temperature-text");


const API_KEY = "e3251a9dc65207fd010c946b91e43f78";  //weather api key

// Function to format the date from YYYY-MM-DD to DD-MM-YYYY
const formatDate = (dateString) => {
    const dateParts = dateString.split(" ")[0].split("-");  // Split the date part
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Rearrange to DD-MM-YYYY
};

//location name
const getLocationName=(data)=>{
    return `<div id="heading" class="flex items-center space-x-2">
            <h1 class="text-purple-800 font-bold text-xl font-serif">${data.name}</h1>
        </div>`
}

//current date
const getcurrentDate = (weatherItem) => {
    const formattedDate = formatDate(weatherItem.dt_txt);  // Use the reusable date formatter
    return `<div id="date" class="date text-center text-white">
                ${formattedDate}
            <h3 class="temperature text-7xl font-bold text-purple-700 text-center">${Math.round(weatherItem.main.temp)}°</h3> 
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon"/>
             <p id="temperature-text" class="temperature-text text-3xl text-white text-center">${weatherItem.weather[0].description.charAt(0).toUpperCase() + weatherItem.weather[0].description.slice(1)}</p>
        </div>
        `;
}

//pressure humidity wind speed

const getForecast = (weatherItem) => {
    // Select the pressure, humidity, and wind speed elements
    const pressureDiv = document.querySelector(".pressure");
    const humidityDiv = document.querySelector(".humidity");
    const windSpeedDiv = document.querySelector(".wind-speed");
    
    // Update the content inside each div accordingly
    pressureDiv.innerHTML = `<h3 id="weather-heading" class="font-bold">${weatherItem.main.pressure} M/B</h3>`;
    humidityDiv.innerHTML = `<h3 id="weather-heading" class="font-bold">${weatherItem.main.humidity}%</h3>`;
    windSpeedDiv.innerHTML = `<h3 id="weather-heading" class="font-bold">${weatherItem.wind.speed} M/S</h3>`;
};

const updateCurrentWeather = (weatherItem) => {
    const temperatureDiv = document.querySelector(".temperature");
    const weatherImage = document.querySelector(".image");
    const temperatureTextDiv = document.querySelector(".temperature-text");

    // Update temperature
    temperatureDiv.textContent = `${weatherItem.main.temp}°`;

    // Update weather image
    weatherImage.src = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;

    // Update weather description (e.g., Sunny, Broken Clouds)
    temperatureTextDiv.textContent = weatherItem.weather[0].description.charAt(0).toUpperCase() + weatherItem.weather[0].description.slice(1);
};

//5 days weather card
const createWeatherCard = (weatherItem) => {
    const formattedDate = formatDate(weatherItem.dt_txt);  // Use the reusable date formatter
    return `    <div class="forecast-content bg-white bg-opacity-30 text-purple-600 rounded-3xl p-4 w-[130px] flex-shrink-0">
                    <h3>(${formattedDate})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon"/>
                    <p>${weatherItem.main.temp}°</p>
                    <p class="forecast-humidity">${weatherItem.main.humidity}%</p>
                    <p class="forecast-wind">${weatherItem.wind.speed}M/S</p>
                </div>`;
};




// Function to fetch weather details using lat, lon
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];

            // Filter the forecasts to get 5 days forecast
            const fiveDayForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (uniqueForecastDays.length < 5 && !uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear the previous input and content
            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            locationName.innerHTML = getLocationName({ name: cityName });
            currentDate.innerHTML = getcurrentDate(fiveDayForecast[0]); // Use the first forecast item for the current date
            // temperatureDiv.innerHTML = getCurrentDate(fiveDayForecast[0]);
            // weatherImage.innerHTML = getCurrentDate(fiveDayForecast[0]);
            
            // Populate the pressure, humidity, and wind speed
            getForecast(fiveDayForecast[0]); // Use the first forecast for current weather stats

            fiveDayForecast.forEach(weatherItem => {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
            });
        })
        .catch(() => {
            alert("An error occurred while fetching weather forecast");
        });
};

// Function to fetch city coordinates
const getCityCoordinates = (e) => {
    e.preventDefault();  // Prevents form submission from refreshing the page
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Fetch entered city coordinates from API response (name, latitude, longitude)
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`Nothing found for ${cityName}`);
            console.log(data)
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching city coordinates");
        });
};

searchButton.addEventListener("click", getCityCoordinates);
