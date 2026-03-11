const cityInput = document.querySelector('.js-city-input');

async function getWeather() {
    const city = cityInput.value;
    cityInput.value = '';

     document.querySelector('.js-city').innerHTML = city;
     saveCity(city);

     document.querySelector('.loading-screen').classList.remove('hidden');

    try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);

    if (!geoResponse.ok) {
        throw new Error('Geocoding request failed');
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
       throw new Error('City was not found');
    }

    const latitude = geoData.results[0].latitude;
    const longitude = geoData.results[0].longitude;

    const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current_weather: true,
    hourly: "apparent_temperature,relative_humidity_2m,pressure_msl,visibility",
    daily: "temperature_2m_max,temperature_2m_min,weathercode",
    timezone: "auto"
    });

    const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
    );

    if (!weatherResponse.ok) {
        throw new Error('Weather request was failed')
    }

    const weatherData = await weatherResponse.json();
    displayWeather(weatherData);
    saveToStorage(weatherData);
    console.log(weatherResponse);
    } catch (error) {
        console.error(error);
        alert(error)
    }
    document.querySelector('.loading-screen').classList.add('hidden');
}

function displayWeather(weatherData) {
    const temperatureToday = Math.round(weatherData.current_weather.temperature);
    const feelsToday = Math.round(weatherData.hourly.apparent_temperature[0]);

    const windSpeed = Math.round(weatherData.current_weather.windspeed);
    const humidity = weatherData.hourly.relative_humidity_2m[0];
    const pressure = Math.round(weatherData.hourly.pressure_msl[0]);
    const visibility = Math.round(weatherData.hourly.visibility[0] / 1000);

    const days = weatherData.daily.time.slice(0,5);
    const maxTemps = weatherData.daily.temperature_2m_max.slice(0,5);
    const minTemps = weatherData.daily.temperature_2m_min.slice(0,5);
    const weatherState = weatherData.daily.weathercode.slice(0,5);

    document.querySelector('.temperature-today').innerHTML = `${temperatureToday}&deg`;
    document.querySelector('.feels-like').innerHTML = `Feels Like: ${feelsToday}&deg`;
    document.querySelector('.show-humidity').innerHTML = `${humidity}%`;
    document.querySelector('.show-wind-speed').innerHTML = `${windSpeed} km/h`;
    document.querySelector('.show-visibility').innerHTML = `${visibility} km`;
    document.querySelector('.show-pressure').innerHTML = `${pressure} mb`;

    const weatherCode = weatherData.current_weather.weathercode;
    let icon;

    if (weatherCode === 0) {
        icon = "sun.png";
    } else if (weatherCode <= 2) {
        icon = "cloudy.png";
    } else if (weatherCode === 3) {
        icon = "cloud.png";
    } else if (weatherCode === 45) {
        icon = "fog.png";
    } else if (weatherCode >= 61 && weatherCode <= 65) {
        icon = "heavy-rain.png";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        icon = "snowflake.png";
    } else {
        icon = "sun.png";
    }

    document.querySelector('.todays-weather-state').src = `images/${icon}`;


    //5 day forecast rendering days of the week
    const today = dayjs();
    const tomorrow = today.add(1, 'day').format('dddd');
    const thirdDay = today.add(2, 'day').format('dddd');
    const fourthDay = today.add(3, 'day').format('dddd');
    const fifthDay = today.add(4, 'day').format('dddd');

    document.querySelector('.tomorrow').innerHTML = tomorrow;
    document.querySelector('.third-day').innerHTML = thirdDay;
    document.querySelector('.fourth-day').innerHTML = fourthDay;
    document.querySelector('.fifth-day').innerHTML = fifthDay;

    //5 day forecast rendering the max and min temperatures
    document.querySelector('.today-max-temp').innerHTML = `${Math.round(maxTemps[0])}&deg`;
    document.querySelector('.today-min-temp').innerHTML = `${Math.round(minTemps[0])}&deg`;

    document.querySelector('.tomorrow-max-temp').innerHTML = `${Math.round(maxTemps[1])}&deg`;
    document.querySelector('.tomorrow-min-temp').innerHTML = `${Math.round(minTemps[1])}&deg`;

    document.querySelector('.third-day-max-temp').innerHTML = `${Math.round(maxTemps[2])}&deg`;
    document.querySelector('.third-day-min-temp').innerHTML = `${Math.round(minTemps[2])}&deg`;

    document.querySelector('.fourth-day-max-temp').innerHTML = `${Math.round(maxTemps[3])}&deg`;
    document.querySelector('.fourth-day-min-temp').innerHTML = `${Math.round(minTemps[3])}&deg`;

    document.querySelector('.fifth-day-max-temp').innerHTML = `${Math.round(maxTemps[4])}&deg`;
    document.querySelector('.fifth-day-min-temp').innerHTML = `${Math.round(minTemps[4])}&deg`;

    for (let i = 0; i < 5; i++) {

    let pic;

    if (weatherState[i] === 0) {
        pic = "sun.png";
    } else if (weatherState[i] <= 2) {
        pic = "cloudy.png";
    } else if (weatherState[i] === 3) {
        pic = "cloud.png";
    } else if (weatherState[i] === 45) {
        pic = "fog.png";
    } else if (weatherState[i] >= 61 && weatherState[i] <= 65) {
        pic = "heavy-rain.png";
    } else if (weatherState[i] >= 71 && weatherState[i] <= 77) {
        pic = "snowflake.png";
    } else {
        pic = "sun.png";
    }

    document.querySelectorAll('.forecast-pic')[i].src = `images/${pic}`;

}


    console.log(temperatureToday, feelsToday, windSpeed, humidity, pressure, visibility);

    console.log(days, maxTemps, minTemps);
}

document.querySelector('.js-search-button')
.addEventListener('click', getWeather);

document.querySelector('.js-city-input')
.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});

function saveToStorage(data) {
    localStorage.setItem('weatherData', JSON.stringify(data));
}

function loadFromStorage() {
    const savedData = localStorage.getItem('weatherData');

    if (savedData) {
        const weatherData = JSON.parse(savedData);
        displayWeather(weatherData);
    }
}

loadFromStorage();

function saveCity(city) {
    localStorage.setItem('city', city);
}

function loadCity() {
    const savedCity = localStorage.getItem('city');
    
    if(savedCity) {
        document.querySelector('.js-city').innerHTML = savedCity;
    }
}

loadFromStorage();
loadCity();