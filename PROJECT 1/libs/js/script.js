let marker = null;
let clickedLatLng = null;
let userCountryLayer = null;
let userLocationFound = false; // Track if user location is found
let geoJsonLoaded = false; // Track if GeoJSON is loaded

// Show loader while the page is loading
document.getElementById('preloader').style.display = 'flex';

// Initialize Leaflet Map with faster zoom settings
const map = L.map('map', {
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true,
    inertia: true,
    inertiaDeceleration: 2000,
    zoomAnimation: true,
    zoomSnap: 1,
    zoomDelta: 5,
    wheelPxPerZoomLevel: 120, 
    zoomControl: true
}).setView([20, 0], 2);

const Streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Ãƒâ€šÃ‚Â© OpenStreetMap contributors',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Source: Esri, USGS, NOAA',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Source: Esri, National Geographic',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const Jawg_Matrix = L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=DSkywDmZAwXD3dsZbUNfIFHJvAUqdSVtMDe5eAbdJYhZUXJcg72lCMDNuqpf91UT', {
    attribution: 'Map data Ã‚Â© Jawg Maps',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

// Overlay layers
const WaymarkedTrails_hiking = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)'
});

const WaymarkedTrails_cycling = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)'
});

const WaymarkedTrails_slopes = L.tileLayer('https://tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)'
});

const OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; OpenRailwayMap (CC-BY-SA)'
});

const Stadia_StamenTonerLines = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; Stadia Maps, Stamen Design, OpenMapTiles, OpenStreetMap contributors',
    ext: 'png'
});

// Base layers for the control
const baseMaps = {
    "Streets": Streets,
    "Topography": Esri_WorldImagery,
    "Vintage": Esri_NatGeoWorldMap,
    "Matrix": Jawg_Matrix
};

// Overlay layers for the control
const overlayMaps = {
    "Hiking Trails": WaymarkedTrails_hiking,
    "Cycling Trails": WaymarkedTrails_cycling,
    "Sloping Trails": WaymarkedTrails_slopes,
    "Railways": OpenRailwayMap,
    "Terrain Lines": Stadia_StamenTonerLines
};

// Add control layers to the map
L.control.layers(baseMaps, overlayMaps).addTo(map);

Streets.addTo(map);

// Set up map bounds to allow side scrolling but limit vertical panning
const southWest = L.latLng(-85, -Infinity);
const northEast = L.latLng(85, Infinity);
const verticalBounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(verticalBounds);

map.on('drag', function () {
    map.panInsideBounds(verticalBounds, { animate: false });
});

map.on('zoomend', function () {
    if (map.getZoom() < 2) {
        map.setZoom(2);
    }
});

map.on('click', function (e) {
    clickedLatLng = e.latlng;

    // Place the marker
    marker = L.marker(clickedLatLng).addTo(map);

    // Fetch country data including the flag
    fetchCountryDataWithFlag(clickedLatLng.lat, clickedLatLng.lng);
});

function fetchCountryDataWithFlag(lat, lng) {
    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { lat: lat, lng: lng },
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
                return;
            }

            if (data.flag) { 
                const flagIcon = L.divIcon({
                    html: `<div style="border: 1px solid #333; padding: 1px; background-color: #fff; box-shadow: 1px 1px 1px rgba(0,0,0,0.3); border-radius: 1px; font-size: 30px; text-align: center;">
                                ${data.flag}
                           </div>`,
                    className: 'flag-icon',
                    iconSize: [50, 35], 
                    iconAnchor: [25, 17]
                });
                marker.setIcon(flagIcon);
            }
        },
        error: function (error) {
            console.error('Error fetching data from PHP:', error);
            alert('Error fetching data from PHP. Check the console for details.');
        }
    });
}

let geoJsonLayer; // Define geoJsonLayer variable in a broader scope
let previouslyHighlightedLayer = null; // Track the previously highlighted country

// Load countries from GeoJSON and populate dropdown
fetch('libs/js/countryBorders.geojson')
    .then(response => response.json())
    .then(data => {
        geoJsonLoaded = true;
        const dropdown = document.getElementById('countryDropdown');
        
        // Create a GeoJSON layer
        geoJsonLayer = L.geoJSON(data, {
            style: function(feature) {
                return {
                    fillColor: 'transparent', // Initial color
                    color: 'transparent', // Default: no border color
                    weight: 1,
                    fillOpacity: 0.5
                };
            }
        }).addTo(map); // Add the layer to your map

        data.features.forEach(country => {
            const option = document.createElement('option');
            option.value = country.properties.iso_a2;
            option.textContent = country.properties.name;
            dropdown.appendChild(option);
        });
    })
    .catch(error => console.error("Error loading GeoJSON:", error));

// Listen for dropdown changes to fetch data by country selection
document.getElementById('countryDropdown').addEventListener('change', function() {
    const selectedISOCode = this.value;
    if (selectedISOCode !== "none") fetchCountryDataByISO(selectedISOCode);
});

// Function to fetch and display country data based on ISO code
function fetchCountryDataByISO(isoCode) {
    $.ajax({
        url: 'libs/php/iso_code.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json', // Expect JSON response
        success: function(data) {
            if (data.country_code) {
                highlightCountryOnMap(data.country_code); // Highlight the selected country on the map
            } else {
                console.error(data.error || "No data found.");
            }
        },
        error: function(error) {
            console.error("Error fetching data:", error);
        }
    });    
}

function highlightCountryOnMap(countryCode) {
    // Check if geoJsonLayer is defined
    if (!geoJsonLayer) {
        console.error("GeoJSON layer not found. Make sure to load the GeoJSON data first.");
        return;
    }

    // Reset previously highlighted country if there is one
    if (previouslyHighlightedLayer) {
        previouslyHighlightedLayer.setStyle({
            fillColor: 'transparent',
            fillOpacity: 0.5,
            color: 'transparent' // Make borders invisible again
        });
    }

    // Find the country feature in the GeoJSON layer
    const countryLayer = geoJsonLayer.getLayers().find(layer => {
        return layer.feature.properties.iso_a2 === countryCode; // Match with ISO code
    });

    if (countryLayer) {
        // Highlight the selected country in red with a visible border
        countryLayer.setStyle({
            fillColor: 'red', // Change the highlight color to red
            fillOpacity: 0.6, // Optional: adjust opacity
            color: '#000', // Border color for the highlighted country
            weight: 1 // Border weight for the highlighted country
        });

        // Store the currently highlighted country layer as the previous one
        previouslyHighlightedLayer = countryLayer;

        // Optional: Set the map view to the highlighted country
        map.fitBounds(countryLayer.getBounds()); // Adjusts map view to the country bounds
    } else {
        console.error("Country not found in GeoJSON layer.");
    }
}

// Function to get user's location and ISO code
function getUserLocationISO() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Fetch country ISO code based on the user's location
                fetchISOCodeByCoordinates(lat, lng);
            },
            function (error) {
                console.error('Error getting user location:', error);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to fetch ISO code by coordinates
function fetchISOCodeByCoordinates(lat, lng) {
    // Assuming 'libs/php/get_iso_code.php' takes lat/lng and returns the ISO code as JSON
    $.ajax({
        url: 'libs/php/get_iso_code.php',
        type: 'GET',
        data: { lat: lat, lng: lng },
        dataType: 'json',
        success: function (data) {
            if (data && data.iso_code) {
                setDropdownToUserCountry(data.iso_code); // Set dropdown if ISO code is found
            } else {
                console.error("ISO code not found for coordinates.");
            }
        },
        error: function (error) {
            console.error("Error fetching ISO code:", error);
        }
    });
}

// Function to set dropdown to user's location country
function setDropdownToUserCountry(isoCode) {
    const dropdown = document.getElementById('countryDropdown');
    dropdown.value = isoCode;
    highlightCountryOnMap(isoCode); // Optionally highlight the country on map
}

// Initial call to get user location and set dropdown
getUserLocationISO();

// Event listener for dropdown changes to fetch data by country selection
document.getElementById('countryDropdown').addEventListener('change', function() {
    const selectedISOCode = this.value;
    if (selectedISOCode !== "none") fetchCountryDataByISO(selectedISOCode);
});

// Load GeoJSON country borders
fetch('libs/js/countryBorders.geojson')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        geoJsonLoaded = true; // GeoJSON has been loaded
        checkLoadingComplete(); // Check if all loading is complete
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
        alert('Error loading GeoJSON file. Check the console for details.');
        checkLoadingComplete(); // Ensure loader is hidden even on error
    });

function fetchCountryData(lat, lng) {
    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { lat: lat, lng: lng },
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
                return;
            }

            const tableBody = document.getElementById('table-body');
            tableBody.innerHTML = '';

            const dataItems = [
                { name: 'Country', value: data.country || 'N/A' },
                { name: 'Capital', value: data.capital || 'N/A' },
                { name: 'Currency', value: data.currency || 'N/A' },
                // Currency Converter should be inserted here
                { name: 'Population', value: data.population || 'N/A' },
                { name: 'Continent', value: data.continent || 'N/A' },
                { name: 'Region', value: data.region || 'N/A' },
                { name: 'Language/s', value: data.languages || 'N/A' },
                { name: 'Date and Time', value: data.timezone || 'N/A' },
                { name: 'Flag', value: data.flag || 'N/A' }
            ];

            const currencyCode = data.currency.split(' / ')[2]; // Extract ISO code
            loadCurrencyOptions(currencyCode); // Populate dropdowns with all currencies

            const wikiLinks = data.wikiTitles || [];
            if (wikiLinks.length > 0) {
                let wikiLinksHtml = '<ul>';
                wikiLinks.forEach(wikiItem => {
                    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiItem.title)}`;
                    wikiLinksHtml += `<li><a href="${wikiUrl}" target="_blank">${wikiItem.title}</a></li>`;
                });
                wikiLinksHtml += '</ul>';

                dataItems.push({
                    name: 'Wikipedia Links',
                    value: wikiLinksHtml
                });
            }

            dataItems.forEach((item, index) => {
                const row = document.createElement('tr');
                const nameCell = document.createElement('td');
                const valueCell = document.createElement('td');

                nameCell.textContent = item.name;
                valueCell.innerHTML = item.value; // Use innerHTML to allow link rendering

                row.appendChild(nameCell);
                row.appendChild(valueCell);
                tableBody.appendChild(row);

                // Insert Currency Converter after Currency row and before Population row
                if (item.name === 'Currency') {
                    const currencyConverterHtml = `
                        <tr>
                            <td>Currency Converter</td>
                            <td>
                                <input type="number" id="conversion-amount" placeholder="Amount" value="1" min="1">
                                <select id="from-currency"></select>
                                <select id="to-currency"></select>
                                <span id="conversion-result">Result: --</span>
                                <button onclick="convertCurrency()">Convert</button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', currencyConverterHtml);
                }
            });

            $('#data-table').show(); // Ensure the data table is displayed
        },
        error: function (error) {
            console.error('Error fetching data from PHP:', error);
            alert('Error fetching data from PHP. Check the console for details.');
        }
    });
}

function loadCurrencyOptions(defaultCurrency) {
    $.ajax({
        url: 'libs/php/load_currency_options.php', 
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
                return;
            }

            const currencies = data.currencies;
            const fromDropdown = document.getElementById('from-currency');
            const toDropdown = document.getElementById('to-currency');

            currencies.forEach(currency => {
                const option = `<option value="${currency}" ${currency === defaultCurrency ? 'selected' : ''}>${currency}</option>`;
                fromDropdown.insertAdjacentHTML('beforeend', option);
                toDropdown.insertAdjacentHTML('beforeend', option);
            });
        },
        error: function (error) {
            console.error("Error fetching currencies:", error);
            alert("Error loading currency options. Check the console for details.");
        }
    });
}

function convertCurrency() {
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const amount = document.getElementById('conversion-amount').value || 1;

    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { from: fromCurrency, to: toCurrency, amount: amount },
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                document.getElementById('conversion-result').textContent = `Result: ${response.convertedAmount}`;
            }
        },
        error: function (error) {
            console.error('Error fetching currency conversion:', error);
            alert('Error fetching currency conversion. Check the console for details.');
        }
    });
}

// Fetch weather data 
function fetchWeatherData(lat, lng) {
    $.ajax({
        url: 'libs/php/geo_weather.php',
        type: 'GET',
        data: { lat: lat, lng: lng },
        dataType: 'json',
        success: function (data) {
            displayWeatherData(data);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Check the console for details.');
        }
    });
}

function displayWeatherData(data) {
    const weatherContainer = document.querySelector('.weather-container');

    // Ensure the container element exists
    if (!weatherContainer) {
        console.error("Weather container element is missing.");
        return;
    }

    // Clear any previous data in the container
    weatherContainer.innerHTML = '';

    // Create main weather display
    const cityHeader = document.createElement('div');
    cityHeader.className = 'weather-header';
    cityHeader.innerHTML = `<h2>Weather Forecast</h2>`;

    const mainWeatherInfo = document.createElement('div');
    mainWeatherInfo.className = 'main-weather-info';
    mainWeatherInfo.innerHTML = `
        <div class="weather-location">
            <p>${data.city_name || 'Unknown City'}, ${data.country_code || 'N/A'}</p>
        </div>
        <div class="weather-temp">
            <span class="temp">${data.temperature_c || 'N/A'}</span>°C
        </div>
        <div class="weather-desc">
            <p>${getWeatherIcon(data.weather)} ${data.weather || 'N/A'}</p>
        </div>
        <div class="weather-extra">
            <p>Humidity: ${data.humidity || 'N/A'}%</p>
            <p>Wind: ${data.wind_speed_m_s || 'N/A'} m/s</p>
        </div>
    `;

    // Forecast details (Morning, Afternoon, Evening) 
    const forecastContainer = document.createElement('div');
    forecastContainer.className = 'forecast-container';

    // Check if forecast data exists and populate it
    const forecastData = [
        {
            time: 'Morning',
            temp: data.forecast?.morning?.temperature_c || 'N/A',
            desc: `|| ${data.forecast?.morning?.description || 'N/A'} ||`,
            weather: data.forecast?.morning?.weather || 'N/A'
        },
        {
            time: 'Afternoon',
            temp: data.forecast?.afternoon?.temperature_c || 'N/A',
            desc: `|| ${data.forecast?.afternoon?.description || 'N/A'} ||`,
            weather: data.forecast?.afternoon?.weather || 'N/A'
        },
        {
            time: 'Evening',
            temp: data.forecast?.evening?.temperature_c || 'N/A',
            desc: `|| ${data.forecast?.evening?.description || 'N/A'} ||`,
            weather: data.forecast?.evening?.weather || 'N/A'
        }
    ];

    // Iterate through the forecast data and append it to the forecast container
    forecastData.forEach(forecast => {
        const forecastDiv = document.createElement('div');
        forecastDiv.className = 'forecast';
        forecastDiv.innerHTML = `
            <p><strong>${forecast.time}</strong></p>
            <div class="forecast-icon">${getWeatherIcon(forecast.weather)}</div>
            <p>${forecast.temp}°C</p>
            <p>${forecast.desc}</p>
        `;
        forecastContainer.appendChild(forecastDiv);
    });

    // Append the main weather info and forecast container to the weather container
    weatherContainer.appendChild(cityHeader);
    weatherContainer.appendChild(mainWeatherInfo);
    weatherContainer.appendChild(forecastContainer);

    // Show the weather container
    weatherContainer.style.display = 'block';

    // Position the weather container close to the marker
    if (marker) {
        const markerPoint = map.latLngToContainerPoint(marker.getLatLng());
        const containerHeight = weatherContainer.offsetHeight;
        const containerWidth = weatherContainer.offsetWidth;
        const mapSize = map.getSize();

        const adjustedYPosition = Math.min(markerPoint.y + 15, mapSize.y - containerHeight - 15);
        const adjustedXPosition = Math.min(markerPoint.x + 15, mapSize.x - containerWidth - 15);

        weatherContainer.style.position = 'absolute';
        weatherContainer.style.left = `${adjustedXPosition}px`;
        weatherContainer.style.top = `${adjustedYPosition}px`;
    }
}

// Helper function to get weather icon based on description
function getWeatherIcon(description) {
    if (description.toLowerCase().includes("clear")) return '🌅';  // Clear sky
    if (description.toLowerCase().includes("clouds")) return '☁️'; // Cloudy
    if (description.toLowerCase().includes("rain")) return '🌧️';
    if (description.toLowerCase().includes("mist")) return '🌧️';   // Rainy
    if (description.toLowerCase().includes("snow")) return '❄️';   // Snowy
    return '🌥️'; // Default icon for mixed weather
}


// Function to check if loading is complete
function checkLoadingComplete() {
    if (geoJsonLoaded && userLocationFound) {
        // Hide loader once GeoJSON and user location data are loaded
        document.getElementById('preloader').style.display = 'none';
    }
}

// Button click to fetch country and weather data
document.getElementById('get-data-btn').onclick = function () {
    if (clickedLatLng) {
        // Fetch country and weather data for clicked location without showing loader again
        fetchCountryData(clickedLatLng.lat, clickedLatLng.lng);
        fetchWeatherData(clickedLatLng.lat, clickedLatLng.lng);
    } else {
        alert("Please click on the map to select a location.");
    }
};

// Function to fetch news data based on the given coordinates
function fetchNewsData(lat, lng) {
    if (lat && lng) {
        $.ajax({
            url: 'libs/php/news.php',
            type: 'GET',
            data: { lat: lat, lng: lng },
            dataType: 'json',
            success: function (data) {
                if (data && data.results && data.results.length > 0) {
                    displayNewsData(data.results);
                } else {
                    alert('No news found for this location.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching news data:', error);
                alert('Error fetching news data. Check the console for details.');
            }
        });
    } else {
        alert('Coordinates not available. Please ensure the marker is set on the map.');
    }
}

// Function to display news data in the table
function displayNewsData(articles) {
    const newsTableBody = $('#newsTableTbody');
    newsTableBody.empty(); // Clear existing rows to avoid duplicates

    articles.slice(0, 5).forEach(article => {
        // Create a new table row
        const row = $('<tr></tr>');
        
        // Populate each cell with article data
        row.append($('<td></td>').text(article.title));
        row.append(
            $('<td></td>').html(`<a href="${article.link}" target="_blank">Read More</a>`)
        );

        // Append the row to the table body
        newsTableBody.append(row);
    });

    // Show the news table and hide the data table
    $('#newsTable').show();
    $('#data-table').hide();
    $('.weather-container').hide();
}

// Event listener for the News button
$('#newsButton').on('click', function () {
    if (clickedLatLng) { // Assuming clickedLatLng is available as the current coordinates
        fetchNewsData(clickedLatLng.lat, clickedLatLng.lng);
    } else {
        alert('Coordinates not available. Please ensure the marker is set on the map.');
    }
});

// Toggle function for the Data button to show the data table
$('#get-data-btn').on('click', function () {
    $('#newsTable').hide();
    $('#data-table').show();
    $('.weather-container').show();
});

// Function to get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Mark user location on the map
                marker = L.marker([lat, lng]).addTo(map);
                userLocationFound = true; // Set location found
                checkLoadingComplete(); // Check if all loading is complete

                // Fetch country and weather data for user's location
                fetchCountryData(lat, lng);
                fetchWeatherData(lat, lng);
                fetchCountryDataWithFlag(lat, lng);

                // Center map on user location
                map.setView([lat, lng], 5);
            },
            function (error) {
                console.error('Error getting user location:', error);
                alert('Unable to retrieve your location. Showing default map view.');
                userLocationFound = true; // Set location found
                checkLoadingComplete(); // Check if all loading is complete
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
        userLocationFound = true; // Set location found
        checkLoadingComplete(); // Check if all loading is complete
    }
}

// Call getUserLocation when the page loads
getUserLocation();