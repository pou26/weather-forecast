const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentLocationButton = document.querySelector(".current-location button");
const weatherCardsDiv = document.querySelector(".forecast-slides");
const locationName = document.querySelector(".location-header");
const currentDate= document.querySelector(".date");
const temperatureDiv = document.querySelector(".temperature");
const weatherImage = document.querySelector(".image");
const temperatureTextDiv = document.querySelector(".temperature-text");
const dropdownMenu = document.querySelector(".recent-cities-dropdown");



const API_KEY = "e3251a9dc65207fd010c946b91e43f78";  //weather api key
const MAX_RECENT_CITIES = 5; // Limit the number of recent cities

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
    return `    <div class="forecast-content text-white rounded-3xl p-4 w-[130px] flex-shrink-0">
                    <h3>(${formattedDate})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon"/>
                    <p>${weatherItem.main.temp}°</p>
                    <p class="forecast-humidity">${weatherItem.main.humidity}%</p>
                    <p class="forecast-wind">${weatherItem.wind.speed}M/S</p>
                </div>`;
};


// Add city to local storage for recently searched cities

const addCityToRecentSearches = (cityName) => {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    if (!recentCities.includes(cityName)) {
        recentCities.unshift(cityName);  // Add the city to the beginning of the array
        if (recentCities.length > MAX_RECENT_CITIES) {
            recentCities.pop();  // Remove the oldest city if more than MAX_RECENT_CITIES
        }
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
};

// Function to populate the dropdown with recently searched cities

const populateDropdown = () => {
    dropdownMenu.innerHTML = '';  // Clear existing dropdown content
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    if (recentCities.length) {
        recentCities.forEach(city => {
            const cityElement = document.createElement('li');
            cityElement.textContent = city;
            cityElement.classList.add("recent-city-item");
            cityElement.addEventListener("click", () => {
                getCityCoordinatesFromDropdown(city);  // Fetch weather for the selected city
            });
            dropdownMenu.appendChild(cityElement);
        });
    }
};

// Handle city selection from dropdown

const getCityCoordinatesFromDropdown = (cityName) => {
    cityInput.value = cityName;  // Set the input value to the selected city
    getCityCoordinates();  // Fetch weather for the selected city
};

// Function to fetch city coordinates

const getCityCoordinates = (e) => {
    if (e) e.preventDefault();  // Prevent form submission from refreshing the page
    const cityName = cityInput.value.trim();
    if (!cityName || cityName==" ") return alert('Error! Search box cannot be empty.');;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Fetch entered city coordinates from API response (name, latitude, longitude)

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {

            if (!data.length) return alert(`Invalid! Nothing found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);

            // Add city to recently searched cities

            addCityToRecentSearches(name);
            populateDropdown();  // Update the dropdown with new city
        })
        .catch(() => {
            alert("An error occurred while fetching city coordinates");
        });
};

// Initial call to populate dropdown on page load
populateDropdown();


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



const getUserCoordinates = (event) => {
    event.preventDefault(); // Prevent form submission
    navigator.geolocation.getCurrentPosition(
        position => {
            const{latitude,longitude}=position.coords;
            const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //get city coordinates using reverse geocoding api
            
            fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            })
            .catch(() => {
                alert("An error occurred while fetching city");
            });
        },
        error => {
            if(error.code===error.PERMISSION_DENIED){
                alert("Geolocation request denied.Please reset location permission to grant access again.")
            }
            
        }
    );
}




// Event listeners
searchButton.addEventListener("click", getCityCoordinates);

currentLocationButton.addEventListener("click", getUserCoordinates);
