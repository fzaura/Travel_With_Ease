const cityTimezones = {
  "Sydney, Australia": "Australia/Sydney",
  "Melbourne, Australia": "Australia/Melbourne",
  "Tokyo, Japan": "Asia/Tokyo",
  "Kyoto, Japan": "Asia/Kyoto",
  "Rio de Janeiro, Brazil": "America/Sao_Paulo",
  "São Paulo, Brazil": "America/Sao_Paulo",
};

const searchForm = document.getElementById("search-form");
const searchField = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");
const resultsSection = document.getElementById("results-section");
const clearBtn = document.getElementById("clear-btn");
const submitMessageBtn = document.getElementById("submitMessageBtn");

function renderResults(results) {
  resultsContainer.innerHTML = "";

  if (results.length === 0) {
    resultsContainer.innerHTML =
      '<p style="color:white;">No results found.</p>';
    return;
  }

  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("result-card");

    const img = document.createElement("img");
    img.src = result.imageUrl;
    img.alt = result.name;

    const destinationName = document.createElement("h3");
    destinationName.textContent = result.name;

    const destinationDescription = document.createElement("p");
    destinationDescription.textContent = result.description;

    const visitButton = document.createElement("button");
    visitButton.textContent = "Visit";

    div.appendChild(img);
    div.appendChild(destinationName);
    div.appendChild(destinationDescription);
    div.appendChild(visitButton);

    if (result.isCity) {
      const timezone = cityTimezones[result.name];
      if (timezone) {
        getLocalTime(timezone).then((time) => {
          const timeDiv = document.createElement("div");
          timeDiv.id = "local-time";
          timeDiv.textContent = `Time in ${result.name}: ${time}`;
          div.prepend(timeDiv);
        });
      }
    }
    resultsContainer.appendChild(div);
  });
}

function performSearch(event) {
  event.preventDefault();

  const user_input = searchField.value;

  if (!user_input) {
    resultsContainer.innerHTML = "";
    resultsSection.style.display = "none";
    return;
  }

  const dataJSON = "./travel_with_ease_api.json";

  axios
    .get(dataJSON)
    .then((response) => {
      const query = user_input.toLowerCase();
      const searchResults = [];
      const data = response.data;

      for (const key in data) {
        if (key === "countries") {
          data[key].forEach((country) => {
            country.cities.forEach((city) => {
              if (
                city.name.toLowerCase().includes(query) ||
                country.name.toLowerCase().includes(query)
              ) {
                city.isCity = true;
                searchResults.push(city);
              }
            });
          });
        } else {
          data[key].forEach((item) => {
            if (item.name.toLowerCase().includes(query)) {
              searchResults.push(item);
            }
          });
        }
      }

      resultsSection.style.display = "block";
      renderResults(searchResults);
    })
    .catch((error) => {
      console.error("error loading or processing data", error);
      resultsContainer.innerHTML = "<p>Could not load travel data.</p>";
      resultsSection.style.display = "block";
    });
}

function getLocalTime(timezone) {
  const apiURL = `https://worldtimeapi.org/api/timezone/${timezone}`;

  return axios
    .get(apiURL)
    .then((response) => {
      const { datetime } = response.data;
      const date = new Date(datetime);
      const options = {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const formattedTime = date.toLocaleTimeString("en-US", options);

      return formattedTime;
    })
    .catch((error) => {
      console.error("error fetching local time", error);
      return "time not available";
    });
}

submitMessageBtn.addEventListener("click", () => {
  alert("Thank you for your message!");
});
searchForm.addEventListener("submit", performSearch);
searchField.addEventListener("input", performSearch);
clearBtn.addEventListener("click", () => {
  searchField.value = "";
  resultsContainer.innerHTML = "";
  resultsSection.style.display = "none";
});
