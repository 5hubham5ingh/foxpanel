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
  const [getWall, setWall, onChange] = SharedState("wall");
  const applyBackground = (newWall) => {
    document.body.style.backgroundImage = `url(${newWall.source})`;
  };
  getWall().then(applyBackground);
  onChange(applyBackground);
} catch (_) { /*When not running as extensions script.*/ }

function setColorUsingTheme(theme) {
  if (!theme) return;
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

/*================== Main ====================*/
const searchBar = document.getElementById("search");
searchBar.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const query = searchBar.value.trim();
    if (query) {
      const url = `https://www.google.com/search?q=${
        encodeURIComponent(query)
      }`;
      window.open(url, "_blank");
    }
    searchBar.value = "";
  }
});

const openPanelsButton = document.getElementById("openPanels");
const closePanelsButton = document.getElementById("closePanels");
const panels = document.getElementsByClassName("panel");
const main = document.getElementById("main");
let isPanelVisible = false;

const closePanels = () => {
  for (const panel of panels) {
    // Scale and Fade Out
    main.style.visibility = "visible";
    panel.style.opacity = 1;
    panel.style.transform = "scale(3)";
    panel.style.opacity = 0;

    // blur in
    main.style.opacity = 0;
    main.style.opacity = 1;

    setTimeout(() => {
      panel.style.visibility = "collapse";
    }, 500);

    isPanelVisible = false;
    searchBar.focus();
  }
};

const openPanels = () => {
  for (const panel of panels) {
    // Scale and Fade In
    panel.style.opacity = 0;
    panel.style.visibility = "visible";
    panel.style.transform = "scale(1)";
    panel.style.opacity = 1;

    // blur out
    main.style.opacity = 1;
    main.style.visibility = "collapse";
    main.style.opacity = 0;

    isPanelVisible = true;
  }
};

closePanelsButton.addEventListener("click", closePanels);

openPanelsButton.addEventListener("click", openPanels);

document.addEventListener("keydown", function (event) {
  if (event.altKey && event.key === "Enter") {
    isPanelVisible ? closePanels() : openPanels();
  }
});

/*============================================= Left panel ==============================================*/
/*------------------------------- Page zoom lever -------------------*/
const rangeInput = document.getElementById("zoom");
const body = document.body;
const zoomLevelCache = localStorage.getItem("zl");

function setZoom() {
  const value = this.value ?? (rangeInput.value = zoomLevelCache ?? 100);
  localStorage.setItem("zl", value);

  const zoomLevel = value / 100; // Convert range to zoom level

  body.style.transform = `scale(${zoomLevel})`;
  body.style.transformOrigin = "top left";
  body.style.width = `${100 / zoomLevel}%`;

  const isZoomOut = zoomLevel < 1;
  const newHeight = isZoomOut
    ? `${100 / zoomLevel}vh`
    : `${(100 / zoomLevel) - (2 * zoomLevel)}vh`;
  body.style.height = newHeight;
  document.documentElement.style.setProperty(
    "--container-height",
    newHeight,
  );
}

setZoom();
rangeInput.addEventListener("input", setZoom);

/*---------------------- Pomodoro --------------------*/
const timerElement = document.querySelector(".countdown-text");
const startButton = document.getElementById("startButton");
const circleElement = document.querySelector("circle");
var playing = false;
var startTime = 25 * 60;
var timeleft = startTime;
let intervalId;

function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}
timerElement.innerText = `${
  formatTime(
    Math.floor(startTime / 60),
  )
}:${formatTime(startTime - Math.floor(startTime / 60) * 60)}`;

function countdown() {
  timeleft = timeleft - 1;
  let minutes = Math.floor(timeleft / 60);
  let seconds = timeleft - minutes * 60;
  timerElement.innerText = `${formatTime(minutes)}:${formatTime(seconds)}`;
  circleElement.style.strokeDashoffset = ((startTime - timeleft) / startTime) *
    283;
  if (timeleft < 0) {
    clearInterval(intervalId);
    timerElement.innerText = "nice job!";
    resetTimer();
  }
}

function startTimer() {
  countdown();
  intervalId = setInterval(countdown, 1000);
}

function pauseTimer() {
  clearInterval(intervalId);
}

function resetTimer() {
  pauseTimer();
  playing = false;
  startButton.innerText = "start";
  timeleft = startTime;
  timerElement.innerText = `${
    formatTime(
      Math.floor(startTime / 60),
    )
  }:${formatTime(startTime - Math.floor(startTime / 60) * 60)}`;
  circleElement.style.strokeDashoffset = 0;
}

function onClickFunction() {
  if (playing === false) {
    startButton.innerText = "pause";
    playing = true;
    startTimer();
  } else {
    startButton.innerText = "start";
    playing = false;
    pauseTimer();
  }
}
startButton.addEventListener("click", onClickFunction);

/*---------------------- Controls -------------------*/

// Power buttons
try {
  // Get references to the HTML elements
  const Shutdown = document.getElementById("shutdown");
  const Sleep = document.getElementById("sleep");
  const Hibernate = document.getElementById("hibernate");
  const Reboot = document.getElementById("reboot");

  // Declare constants for the options (assuming NativeFunctions returns an array)
  const [systemctl] = NativeFunctions("systemctl");

  // Add event listeners to each button
  Shutdown.addEventListener(
    "click",
    () => confirm("Initiate system shutdown?") && systemctl("shutdown"),
  );
  Sleep.addEventListener(
    "click",
    () => confirm("Put the computer to sleep?") && systemctl("sleep"),
  );
  Hibernate.addEventListener(
    "click",
    () => confirm("Hibernate the computer?") && systemctl("hibernate"),
  );
  Reboot.addEventListener(
    "click",
    () => confirm("Restart the computer?") && systemctl("reboot"),
  );
} catch (e) {
  console.error(e);
}

// wifi, screenShot, bluetooth, lockscreen, logout
const volume = document.getElementById("volume");
const brightness = document.getElementById("brightness");

function updateSliderBackground(slider) {
  const value = slider.value;
  const max = slider.max; // Get the maximum value of the slider
  const percentage = (value / max) * 100; // Calculate the percentage

  slider.style.background =
    `linear-gradient(to right, var(--active-color) 0% ${percentage}%, var(--content-color) ${percentage}% 100%)`;
}

try {
  // # Screenshot
  const screenShotButtom = document.getElementById("screenShot");
  const [screenShot] = NativeFunctions("screenShot");
  screenShotButtom.onclick = () => screenShot();

  // # Volume
  const [setVolume, getVolume] = NativeFunctions(
    "setVolume",
    "getVolume",
  );

  volume.addEventListener("input", function () {
    setVolume(this.value);
    updateSliderBackground(this);
  });

  getVolume().then((value) => {
    volume.value = value;
    updateSliderBackground(volume);
  });

  // # Screen brightness
  const [setBrightness, getBrightness] = NativeFunctions(
    "setBrightness",
    "getBrightness",
  );

  getBrightness().then((value) => {
    brightness.value = value;
    updateSliderBackground(brightness);
  });

  brightness.addEventListener("input", function () {
    setBrightness(this.value);
    updateSliderBackground(this);
  });

  // # lock screen, logout
  const [systemctl] = NativeFunctions("systemctl");
  const logOutBtn = document.getElementById("logOut");
  const lockScreenBtn = document.getElementById("lockScreen");
  logOutBtn.onclick = () => systemctl("lockscreen");
  lockScreenBtn.onclick = () => systemctl("logout");

  // Wifi and bluetooth menu container
  const menuContainer = document.getElementById("menuContainer");
  const bluetoothButton = document.getElementById("bluetooth");
  const wifiButton = document.getElementById("wifi");

  // # Wifi

  const [
    isWlan0Down,
    isWifiConnected,
    getAvailableWifiConnections,
    connectWifi,
    toggleWlan0Station,
  ] = NativeFunctions(
    "isWlan0Down",
    "isWifiConnected",
    "getAvailableWifiConnections",
    "connectWifi",
    "toggleWlan0Station",
  );

  isWifiConnected().then((state) => {
    if (!state.isConnected) wifiButton.title = `Wifi: ${state.network}`;
  });

  let isWlan0Up = false;
  isWlan0Down().then((isDown) => isWlan0Up = !isDown);

  wifiButton.onclick = () => {
    bluetoothButton.style.border = "none";
    menuContainer.innerText = "";
    menuContainer.innerHTML = "";
    if (menuContainer.classList.contains("open")) {
      menuContainer.classList.remove("open");
      wifiButton.style.border = "none";
      return;
    }

    wifiButton.style.border = "1px solid var(--active-color)";

    const initialState = document.createElement("span");
    initialState.id = "initialStateHeader";
    const wifiPowerButton = document.createElement("button");
    wifiPowerButton.id = "wifiPowerButton";
    wifiPowerButton.innerText = isWlan0Up ? "Off" : "On";
    wifiPowerButton.onclick = () => {
      toggleWlan0Station(!isWlan0Up);
      isWlan0Up = !isWlan0Up;
      menuContainer.innerHTML = "";
      menuContainer.classList.remove("open");
      wifiButton.style.border = "none";
      return;
    };
    initialState.innerText = "Wifi networks";
    initialState.appendChild(wifiPowerButton);
    menuContainer.appendChild(initialState);
    menuContainer.classList.add("open");
    if (isWlan0Up) {
      const state = document.createElement("h1");
      state.innerText = "Loading...";
      state.id = "wifiNetworkFetchingList";
      menuContainer.appendChild(state);
      getAvailableWifiConnections().then((networks) => {
        state.remove();
        networks.forEach((network) => {
          const networkInfoContainer = document.createElement("button");
          if (network?.connected) {
            networkInfoContainer.innerText = `${network.name} : connected`;
          } else networkInfoContainer.innerText = network.name;

          networkInfoContainer.onclick = () => {
            document.getElementById("wifiPassword")?.remove();
            const passwordFieldContainer = document.createElement("div");
            passwordFieldContainer.id = "wifiPassword";

            const passwordField = document.createElement("input");
            passwordField.type = "text";
            passwordField.placeHolder = "Password";
            passwordField.type = "password";

            const handelSubmit = () => {
              const password = passwordField.value.trim();
              connectWifi(network.name, password)
                .then((_res) => {
                  initialState.remove();
                  networkInfoContainer.remove();
                  menuContainer.classList.remove("open");
                })
                .catch((err) => {
                  alert("Wifi connection faile.");
                  console.error(err);
                });
            };

            passwordField.addEventListener("keypress", (e) => {
              if (e.key === "Enter") {
                handelSubmit();
              }
            });

            const submitButtom = document.createElement("button");
            submitButtom.innerText = "✔";
            submitButtom.onclick = handelSubmit;

            passwordFieldContainer.appendChild(passwordField);
            passwordFieldContainer.appendChild(submitButtom);
            networkInfoContainer.insertAdjacentElement(
              "afterend",
              passwordFieldContainer,
            );
          };
          menuContainer.appendChild(networkInfoContainer);
        });
      });
    }
  };

  // # Bluetooth

  const [isBtOn, turnOnBt, turnOffBt, btDevices, connectBt] = NativeFunctions(
    "isBtOn",
    "turnOnBt",
    "turnOffBt",
    "btDevices",
    "connectBt",
  );

  bluetoothButton.onclick = async () => {
    wifiButton.style.border = "none";
    menuContainer.innerText = "";
    menuContainer.innerHTML = "";
    if (menuContainer.classList.contains("open")) {
      menuContainer.classList.remove("open");
      bluetoothButton.style.border = "none";
      return;
    }
    bluetoothButton.style.border = "1px solid var(--active-color)";

    const isBtOff = !(await isBtOn());
    const initialState = document.createElement("span");
    initialState.id = "initialStateHeader";
    initialState.innerText = "Bluetooth";
    const bluetoothPowerButton = document.createElement("button");
    bluetoothPowerButton.id = "bluetoothPowerButton";
    bluetoothPowerButton.innerText = isBtOff ? "On" : "Off";
    bluetoothPowerButton.onclick = async () => {
      isBtOff ? await turnOnBt() : await turnOffBt();
      bluetoothButton.style.border = "none";
      menuContainer.innerText = "";
      menuContainer.innerHTML = "";
      menuContainer.classList.remove("open");
    };

    initialState.appendChild(bluetoothPowerButton);
    menuContainer.appendChild(initialState);
    if (!isBtOff) {
      const state = document.createElement("h1");
      state.innerText = "Loading...";
      state.id = "btDevicesFetchingList";
      menuContainer.appendChild(state);
      btDevices().then((btDevices) => {
        state.remove();
        btDevices.forEach((btDevice) => {
          const btDeviceContainer = document.createElement("button");
          btDeviceContainer.innerText = btDevice.name +
            (btDevice.connected ? ": connected" : "");

          btDeviceContainer.onclick = () => {
            connectBt(btDevice.macAddr);
            menuContainer.classList.remove("open");
            bluetoothButton.style.border = "none";
          };

          menuContainer.appendChild(btDeviceContainer);
        });
      });
    }
    menuContainer.classList.add("open");
  };
} catch (error) {
  console.error(error);
}

/*---------------------- Todo ----------------------*/
// DOM Variables
const todoulList = document.getElementById("todoullist");
const todoAdd = document.getElementById("todoAdd");
const todoInput = document.getElementById("todoInput");
let todoList = {}; // Initialize todoList JSON

// Add event listeners for Add button click or Enter key press
todoAdd.addEventListener("click", addtodoItem);
todoInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addtodoItem();
  }
});

// Utility function to sanitize input
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// Function to add items to the TODO list
function addtodoItem() {
  const inputText = todoInput.value.trim(); // Remove useless whitespaces
  if (inputText === "") {
    return; // Return the function when the input is empty
  }
  const t = "t" + Date.now(); // Generate a Unique ID
  const rawText = inputText;
  todoList[t] = { title: rawText, status: "pending" }; // Add data to the JSON variable
  const li = createTodoItemDOM(t, rawText, "pending"); // Create List item
  todoulList.appendChild(li); // Append the new item to the DOM immediately
  todoInput.value = ""; // Clear Input
  SaveToDoData(); // Save changes
}

function createTodoItemDOM(id, title, status) {
  let li = document.createElement("li");
  li.innerHTML = sanitizeInput(title); // Sanitize before rendering in DOM
  const span = document.createElement("span"); // Create the Cross Icon
  span.setAttribute("class", "todoremovebtn");
  span.textContent = "\u00d7";
  li.appendChild(span); // Add the cross icon to the LI tag
  li.setAttribute("class", "todolistitem");
  if (status === "completed") {
    li.classList.add("checked");
  }
  li.setAttribute("data-todoitem", id); // Set a data attribute to the li so that we can uniquely identify which li has been modified or deleted
  return li; // Return the created `li` element
}

// Event delegation for task check and remove
todoulList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("checked"); // Check the clicked LI tag
    let id = event.target.dataset.todoitem;
    todoList[id].status = (todoList[id].status === "completed")
      ? "pending"
      : "completed"; // Update status
    SaveToDoData(); // Save Changes
  } else if (event.target.tagName === "SPAN") {
    let id = event.target.parentElement.dataset.todoitem;
    event.target.parentElement.remove(); // Remove the clicked LI tag
    delete todoList[id]; // Remove the deleted List item data
    SaveToDoData(); // Save Changes
  }
});

// Save JSON to local Storage
function SaveToDoData() {
  localStorage.setItem("todoList", JSON.stringify(todoList));
}
// Fetch saved JSON and create list items using it
function ShowToDoList() {
  try {
    todoList = JSON.parse(localStorage.getItem("todoList")) || {}; // Parse stored data or initialize empty
    const fragment = document.createDocumentFragment(); // Create a DocumentFragment
    for (let id in todoList) {
      const todo = todoList[id];
      const li = createTodoItemDOM(id, todo.title, todo.status); // Create `li` elements
      fragment.appendChild(li); // Add `li` to the fragment
    }
    todoulList.appendChild(fragment); // Append all `li` to the `ul` at once
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    localStorage.setItem("todoList", "{}"); // Reset corrupted data
  }
}
ShowToDoList();
/*----------------------- Quotes ---------------------*/
async function fetchRandomQuote() {
  try {
    const response = await fetch(
      "https://thequoteshub.com/api/",
    );
    const quote = await response.json();

    document.getElementById("quote-author").textContent = quote.author;
    document.getElementById("quote-text").textContent = quote.text;
  } catch (error) {
    console.error("Error fetching quote:", error);
    document.getElementById("quote-author").textContent = "Error";
    document.getElementById("quote-text").textContent =
      "Failed to fetch quote. Please try again later.";
  }
}

// Fetch quote when page loads
fetchRandomQuote();

/*========================================== right panel ================================================*/
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

/*-------------------------- Git repo stats ------------------------*/
function createRepoWidget({
  username, // GitHub username
  containerId, // ID of the container element
}) {
  const repoContainer = document.getElementById(containerId);

  const languageColors = {
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    TypeScript: "#2b7489",
    Vue: "#41b883",
    React: "#61DAFB",
    Angular: "#E53238",
    Node: "#339933",
    Express: "#000000",
    Django: "#092E20",
    CSS: "#563d7c",
    HTML: "#e34c26",
    Java: "#b07219",
    C: "#555555",
    "C#": "#178600",
    "C++": "#f34b7d",
    Go: "#00add8",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    Rust: "#dea584",
    SQL: "#e38c00",
    MySQL: "#4479A1",
    PostgreSQL: "#336791",
    MongoDB: "#47A248",
    Docker: "#2496ED",
    GitHub: "#181717",
    Azure: "#0078D4",
    AWS: "#FF9900",
  };

  async function fetchRepos() {
    const cacheKey = `repos_${username}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedETag = localStorage.getItem(`${cacheKey}_etag`);
    const now = Date.now();
    const headers = {};

    if (cachedETag) {
      headers["If-None-Match"] = cachedETag;
    }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos`,
      {
        headers,
      },
    );

    if (response.status === 304 && cachedData) {
      return JSON.parse(cachedData);
    }

    if (!response.ok) {
      console.error("GitHub API error:", response.statusText);
      return [];
    }

    const repos = await response.json();
    const eTag = response.headers.get("ETag");

    localStorage.setItem(cacheKey, JSON.stringify(repos));
    localStorage.setItem(`${cacheKey}_timestamp`, now);
    if (eTag) {
      localStorage.setItem(`${cacheKey}_etag`, eTag);
    }

    return repos;
  }

  async function initializeWidget() {
    let repos = await fetchRepos();
    repos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    repos = repos.slice(0, 4);
    const fragment = document.createDocumentFragment();

    repos.forEach((repo) => {
      const card = document.createElement("article");
      card.setAttribute("role", "region");
      card.setAttribute("aria-labelledby", `repo-title-${repo.name}`);

      const languageColor = languageColors[repo.language] || "#cccccc";

      card.innerHTML = `
            <a href="${repo.html_url}" target="_blank" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%; padding: 16px;" aria-label="Repository ${repo.name}">
                <div style="flex: 1;">
                    <h3 id="repo-title-${repo.name}" style="font-size: 1.25rem; font-weight: bold;">${repo.name}</h3>
                    <p style="margin: 8px 0;">${
        repo.description || "No description provided"
      }</p>
                </div>
                <div style="margin-top: auto;">
                    <div style="display: flex; align-items: center; font-size: 0.875rem;">
                        <span style="display: flex; align-items: center; margin-right: 16px;">
                            <span style="width: 10px; height: 10px; background-color: ${languageColor}; border-radius: 50%; margin-right: 4px;"></span>
                            ${repo.language || "N/A"}
                        </span>
                        <span style="display: flex; align-items: center; margin-right: 16px;">
                            <svg width="16" height="16" fill="var(--active-color)" style="margin-right: 4px;"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
                            ${repo.forks_count}
                        </span>
                        <span style="display: flex; align-items: center;">
                            <svg width="16" height="16" fill="var(--active-color)" style="margin-right: 4px;"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
                            ${repo.stargazers_count}
                        </span>
                    </div>
                    <div style="font-size: 0.75rem; margin-top: 8px; color: var(--active-color);">Size: ${repo.size} KB</div>
                </div>
            </a>
        `;

      fragment.appendChild(card);
    });

    repoContainer.innerHTML = "";
    repoContainer.appendChild(fragment);
  }

  initializeWidget();
}

createRepoWidget({
  username: "5hubham5ingh",
  containerId: "repos",
});

//====================================== Dock apps =========================================
const toggleBorder = (button) => {
  button.classList.toggle("clicked");
};

const appConfigs = {
  gitWall: {
    src: "https://5hubham5ingh.github.io/WallRizz/",
    id: "gitWallFrame",
  },
  videoRecorder: {
    src: "https://5hubham5ingh.github.io/video-recorder-widget/",
    id: "vRecorderFrame",
    allow: "camera; microphone; display-capture",
  },
  notes: {
    src: "https://5hubham5ingh.github.io/keep-notes/",
    id: "notesApp",
  },
  searchAwesomesBtn: {
    src: "https://5hubham5ingh.github.io/searchawesomes",
    id: "searchAwesomes",
  },
  radio: {
    src: "https://5hubham5ingh.github.io/web-radio.github.io/",
    id: "radioApp",
  },
};

const createIframe = (config) => {
  const iframe = document.createElement("iframe");
  iframe.src = config.src;
  iframe.id = config.id;
  if (config.allow) {
    iframe.allow = config.allow;
  }
  return iframe;
};

const handleButtonClick = (buttonId, config) => {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.onclick = () => {
    toggleBorder(button);
    button.title = button.title.match(" 🔴")
      ? button.title
      : `${button.title} 🔴`;

    const existingApp = document.getElementById(config.id);
    if (existingApp) {
      if (existingApp.parentElement.style?.visibility === "visible") {
        existingApp.parentElement.style.visibility = "collapse";
        return;
      } else existingApp.parentElement.style.visibility = "visible";
      return;
    }

    const closeButton = document.createElement("button");
    closeButton.innerText = "❌";
    closeButton.title = `Close ${config.id}`;
    closeButton.onclick = () => {
      toggleBorder(button);
      button.title = button.title.replace(" 🔴", "");
      container.remove();
    };

    const openInNewWindowButton = document.createElement("button");
    openInNewWindowButton.innerText = "↗";
    openInNewWindowButton.title = `Open ${config.id} in new browser window`;
    openInNewWindowButton.onclick = () => {
      window.open(config.src, "_blank");
      toggleBorder(button);
      button.title = button.title.replace(" 🔴", "");
      container.remove();
    };

    const newApp = createIframe(config);
    const container = document.createElement("div");

    const minimiseButton = document.createElement("button");
    minimiseButton.innerText = "_";
    minimiseButton.title = `Minimise ${config.id}`;
    minimiseButton.onclick = () => {
      container.style.visibility = "collapse";
      toggleBorder(button);
    };

    container.appendChild(closeButton);
    container.appendChild(minimiseButton);
    container.appendChild(openInNewWindowButton);
    container.appendChild(newApp);
    container.classList.add("dockAppFrame");
    container.style.visibility = "visible";
    document.body.appendChild(container);
  };
};

for (const buttonId in appConfigs) {
  handleButtonClick(buttonId, appConfigs[buttonId]);
}
