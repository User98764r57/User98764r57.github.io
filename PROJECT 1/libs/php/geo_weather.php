<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];
    $apiKey = '62284da8879dda81148a13a700fa244f'; // Your OpenWeatherMap API key

    // Current weather data
    $currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lng}&appid={$apiKey}&units=metric";
    $currentResponse = file_get_contents($currentUrl);

    if ($currentResponse === FALSE) {
        echo json_encode(['error' => 'Unable to fetch weather data.']);
    } else {
        $currentWeatherData = json_decode($currentResponse, true);

        // Prepare a structured response for current weather
        $currentData = [];
        if ($currentWeatherData && isset($currentWeatherData['main'])) {
            $currentData = [
                'city_name' => $currentWeatherData['name'],
                'country_code' => $currentWeatherData['sys']['country'],
                'weather' => $currentWeatherData['weather'][0]['main'],
                'description' => $currentWeatherData['weather'][0]['description'],
                'temperature_c' => $currentWeatherData['main']['temp'], // Celsius
                'temperature_f' => ($currentWeatherData['main']['temp'] * 9/5) + 32, // Fahrenheit
                'temperature_k' => $currentWeatherData['main']['temp'] + 273.15, // Kelvin
                'pressure' => $currentWeatherData['main']['pressure'],
                'humidity' => $currentWeatherData['main']['humidity'],
                'wind_speed_m_s' => $currentWeatherData['wind']['speed'], // m/s
                'wind_speed_mph' => $currentWeatherData['wind']['speed'] * 2.23694, // mph
                'wind_direction' => $currentWeatherData['wind']['deg'],
                'clouds' => $currentWeatherData['clouds']['all'],
                'rain' => isset($currentWeatherData['rain']['1h']) ? $currentWeatherData['rain']['1h'] : null,
                'snow' => isset($currentWeatherData['snow']['1h']) ? $currentWeatherData['snow']['1h'] : null
            ];
        } else {
            echo json_encode(['error' => 'Weather data not available.']);
            exit;
        }

        // Forecast data - only get the forecast for the current day
        $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lng}&appid={$apiKey}&units=metric";
        $forecastResponse = file_get_contents($forecastUrl);

        if ($forecastResponse === FALSE) {
            echo json_encode(['error' => 'Unable to fetch forecast data.']);
        } else {
            $forecastData = json_decode($forecastResponse, true);
            
            // Prepare structured response for forecast (only for the current day)
            $forecastDetails = [];
            if (isset($forecastData['list'])) {
                // Get today's date
                $todayDate = date('Y-m-d');
                
                // Extract forecast for the current day
                foreach ($forecastData['list'] as $forecast) {
                    $date = date('Y-m-d', strtotime($forecast['dt_txt'])); // Date
                    if ($date == $todayDate) {
                        $time = date('H:i', strtotime($forecast['dt_txt'])); // Time
                        
                        // Determine the period (morning, afternoon, evening)
                        if ($time >= '06:00' && $time < '12:00') {
                            $period = 'morning';
                        } elseif ($time >= '12:00' && $time < '18:00') {
                            $period = 'afternoon';
                        } elseif ($time >= '18:00' && $time < '23:59') {
                            $period = 'evening';
                        } else {
                            continue; // Skip if outside of the desired periods
                        }

                        // Save forecast details for the current day
                        $forecastDetails[$period] = [
                            'temperature_c' => $forecast['main']['temp'], // Temperature in Celsius
                            'temperature_f' => ($forecast['main']['temp'] * 9/5) + 32, // Temperature in Fahrenheit
                            'temperature_k' => $forecast['main']['temp'] + 273.15, // Temperature in Kelvin
                            'wind_speed_m_s' => $forecast['wind']['speed'], // Wind speed in m/s
                            'wind_speed_mph' => $forecast['wind']['speed'] * 2.23694, // Wind speed in mph
                            'weather' => $forecast['weather'][0]['main'], // Weather condition
                            'description' => $forecast['weather'][0]['description'] 
                        ];
                    }
                }
            }

            // Send the final structured JSON response with current weather and today's forecast
            $responseData = array_merge($currentData, ['forecast' => $forecastDetails]);
            echo json_encode($responseData);
        }
    }
} else {
    echo json_encode(['error' => 'Invalid request.']);
}
