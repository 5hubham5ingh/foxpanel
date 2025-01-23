const apiKey = "acdffa918ce63d18185d3897fa4d5024"; // Replace with your OpenWeatherMap API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

/*-------- Set browser theme and background image --------*/
try {
  browser.theme.getCurrent().then(setColorUsingTheme);
  browser.theme.onUpdated.addListener((change) =>
    setColorUsingTheme(change.theme)
  );

  // temp set wallpaper listener
  const [setWall, onChange] = SharedState("wall");
  const applyBackground = (newWall) => {
    document.body.style.backgroundImage = `url(${newWall.source})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.width = "100%";
    document.body.style.height = "100vh";
    document.body.style.backgroundAttachment = "fixed";
  };
  setWall((wall) => {
    applyBackground(wall);
    return wall;
  });
  onChange(applyBackground);
} catch (_) { /*When not running as extensions script.*/ }

function setColorUsingTheme(theme) {
  const textColor = theme.colors.ntp_text;
  const cardBackground = theme.colors.ntp_card_background;
  const contentBackground = theme.colors.ntp_background;
  const activeColor = theme.colors.tab_selected;
  document.documentElement.style.setProperty(
    "--background-color",
    cardBackground,
  );
  document.documentElement.style.setProperty(
    "--content-color",
    contentBackground,
  );
  document.documentElement.style.setProperty(
    "--text-color",
    textColor,
  );
  document.documentElement.style.setProperty(
    "--active-color",
    activeColor,
  );
}

/*---------------------- clock -----------------------*/

const hour1 = document.querySelectorAll(".hours .digit")[0];
const hour2 = document.querySelectorAll(".hours .digit")[1];
const minute1 = document.querySelectorAll(".minutes .digit")[0];
const minute2 = document.querySelectorAll(".minutes .digit")[1];
const second1 = document.querySelectorAll(".seconds .digit")[0];
const second2 = document.querySelectorAll(".seconds .digit")[1];
const setNumber = (element, number) => {
  const show = element.querySelectorAll(`.n${number}`);
  const hide = element.querySelectorAll(`:not(.n${number})`);

  hide.forEach((el) => {
    el.classList.remove("active");
  });
  show.forEach((el) => {
    el.classList.add("active");
  });
};
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  setNumber(hour1, Math.floor(hours / 10));
  setNumber(hour2, Math.floor(hours % 10));
  setNumber(minute1, Math.floor(minutes / 10));
  setNumber(minute2, Math.floor(minutes % 10));
  setNumber(second1, Math.floor(seconds / 10));
  setNumber(second2, Math.floor(seconds % 10));
}, 1000);

/*---------------------- weather -----------------------*/

document
  .getElementById("weatherForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let city = document.getElementById("cityInput").value;
    city = city.trim();
    getWeather(city);
    document.getElementById("cityInput").placeHolder = ` ${city}`;
  });

function getWeather(city) {
  fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`)
    .then((response) => response.json())
    .then((data) => {
      updateWeather(data);
      return fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
    });
}

function updateWeather(data) {
  document.getElementById("weatherDescription").innerText =
    data.weather[0].description;
  document.getElementById("temperature").innerText = `${
    Math.round(
      data.main.temp,
    )
  }°`;
  document.getElementById("feelsLike").innerText = `+${
    Math.round(
      data.main.feels_like,
    )
  }°`;
  document.getElementById("tempRange").innerText = `+${
    Math.round(
      data.main.temp_max,
    )
  }° to ${Math.round(data.main.temp_min)}°`;
  document.getElementById("windSpeed").innerText = `${data.wind.speed} km/h`;
  document.getElementById("humidity").innerText = `${data.main.humidity}%`;
  document.getElementById("visibility").innerText = `${
    data.visibility / 1000
  } km`;
}

// Fetch weather for default city on page load
getWeather("New Delhi");

/*---------------------- calender -----------------------*/
let display = document.querySelector("#display");
let days = document.querySelector("#days");
let previous = document.querySelector(".left");
let next = document.querySelector(".right");

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

function calendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let firstDayIndex = firstDay.getDay();
  let numberOfDays = lastDay.getDate();
  let nextDays = new Date(year, month, numberOfDays).getDay();
  display.textContent = date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  for (let i = 1; i <= firstDayIndex; i++) {
    const div = document.createElement("div");
    div.textContent += i;
    div.className = "inactive";
    days.appendChild(div);
  }

  for (let j = 1; j <= numberOfDays; j++) {
    let div = document.createElement("div");
    let currDate = new Date(year, month, j);
    div.dataset.date = currDate.toDateString();
    div.textContent += j;
    days.appendChild(div);
    if (
      currDate.getFullYear() === new Date().getFullYear() &&
      currDate.getMonth() === new Date().getMonth() &&
      currDate.getDate() === new Date().getDate()
    ) {
      div.classList.add("current-date");
    }
  }

  for (let i = nextDays; i < 6; i++) {
    const div = document.createElement("div");
    div.textContent += i - nextDays + 1;
    div.className = "inactive";
    days.appendChild(div);
  }
}
calendar();

previous.addEventListener("click", () => {
  days.innerHTML = "";
  if (month < 0) {
    month = 11;
    year--;
  }
  month--;
  date.setMonth(month);
  calendar();
});

next.addEventListener("click", () => {
  days.innerHTML = "";
  if (month > 11) {
    month = 0;
    year++;
  }
  month++;
  date.setMonth(month);
  calendar();
});

/*------------------------------- Page zoom lever -------------------*/
const rangeInput = document.querySelector(".level");

rangeInput.addEventListener("input", function () {
  const zoomLevel = this.value / 100; // Convert range to zoom level
  // Apply zoom to body
  document.body.style.transform = `scale(${zoomLevel})`;
  document.body.style.transformOrigin = "top left";

  document.body.style.width = `${100 / zoomLevel}%`;
  document.body.style.height = `${100 / zoomLevel}%`;
});
