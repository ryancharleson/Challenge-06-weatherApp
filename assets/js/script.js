const apiKey = 'afb7607504982df6a736e26df1c0f169';


let recentSearches = [];

let saveSearch = function (city) {
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
};


// Function to fetch 5 day forecast
fetchForecast = function (lat, lon) {
    let fetchURL = 'https://api.openweathermap.org/data/2.5/onecall?lat='
        + lat
        + '&lon='
        + lon
        + '&exclude=hourly,minutely'
        + '&units=imperial'
        + '&appid='
        + apiKey;

    fetch(fetchURL)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    const { uvi } = data.current;
                    document.querySelector('.uvindex').innerText = 'UV Index ' + uvi;
                    if (uvi <= 2) {
                        $('.uvindex').addClass('is-success').removeClass('is-warning is-danger')
                    }
                    else if (uvi < 6) {
                        $('.uvindex').addClass('is-warning').removeClass('is-success is-danger')
                    }
                    else if (uvi > 6) {
                        $('.uvindex'), addClass('is-danger').removeClass('is-success is-warning')
                    };

                    const { daily } = data
                    fiveDayForecast(daily);
                })
            }
            else {
                throw new Error(response.statusText);
            }
        });
};

// Clears 5 day weather

clearFiveDay = function () {
    $('.five-day-weather').empty();
};

fiveDayForecast = function (data) {
    clearFiveDay();
    for (let i = 1; i < 6; i++) {
        const date = moment.utc(data[i].dt * 1000).format('M/D/YYYY');
        const icon = data[i].weather[0].icon;

        const divColumn = $('<div>').addClass('column is-one-fifth day has-text-centered card');
        const edate = $('<p>').text(date);
        const eicon = $('<img>').attr('src', 'https://openweathermap.org/img/wn/' + icon + '.png');
        const ewind = $('<p>').text('Wind Speed: ' + data[i].wind_speed + ' mph');
        const etemp = $('<p>').text('Temp: ' + data[i].temp.day + '°F');
        const ehumidity = $('<p>').text('Humidity: ' + data[i].humidity + '%');

        divColumn.append(edate, eicon, ewind, etemp, ehumidity);
        $('.five-day-weather').append(divColumn);

    }
};

fillArray = function () {
    recentSearches = JSON.parse(localStorage.getItem('recentSearches'));
    if (!recentSearches) {
        recentSearches = []
    }
    fillRecentSearches(recentSearches);
};

fillRecentSearches = function (data) {
    $('.recent-cities').empty();
    for (let i = data.length - 1; i >= 0; i--) {
        const recentCity = $('<button>').addClass('recent-city-btn button is-centered-text is-rounded m-1 is-fullwidth mx-2').attr('city', data[i]).text(data[i]);
        $('.recent-cities').append(recentCity);

    }
};

let weather = {
    fetchWeather: function (city) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q="
            + city
            + "&units=imperial&appid="
            + apiKey
        )
            .then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        saveSearch(city);
                        fillArray();
                        this.displayWeather(data)
                    });
                }
                else {
                    alert('City Not Found, Please Try Again')
                }
            })
    },
    displayWeather: function (data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;
        const { lat } = data.coord;
        const { lon } = data.coord;
        document.querySelector('.city').innerText = 'Weather In ' + name;
        document.querySelector('.weathericon').src = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
        document.querySelector('.description').innerText = description;
        document.querySelector('.temp').innerText = temp + '°F';
        document.querySelector('.humidity').innerText = 'Humidity: ' + humidity + '%';
        document.querySelector('.wind').innerText = 'Wind Speed: ' + speed + ' mph';

        fetchForecast(lat, lon);
    },
    search: function (city) {
        this.fetchWeather(city);
    }

};

fillArray();

document.querySelector('.recent-cities').addEventListener('click', function (event) {
    let city = event.target.getAttribute('city');
    weather.search(city);
    fillArray();
});

document.querySelector('.search button').addEventListener('click', function () {
    let searchValue = document.querySelector('.search-bar').value
    weather.search(searchValue);
    fillArray()
});

document.querySelector('.search-bar').addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
        let searchValue = document.querySelector('.search-bar').value
        weather.search(searchValue);
    fillArray()
    }
});


