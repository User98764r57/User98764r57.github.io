<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if ISO code is provided
if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];

    // REST Countries API URL to get details about the country using the ISO code
    $restCountriesUrl = "https://restcountries.com/v3.1/alpha/$isoCode";

    // Initialize a cURL session to get country info from REST Countries API
    $curl = curl_init($restCountriesUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    // Execute the cURL request and decode the response
    $restCountriesResponse = curl_exec($curl);
    curl_close($curl);
    $restCountriesData = json_decode($restCountriesResponse, true);

    // Check if data from REST Countries API is valid
    if (isset($restCountriesData[0])) {
        $countryDetails = $restCountriesData[0];
        $countryData = [
            'iso_code' => $isoCode,
            'country_code' => $countryDetails['cca2'], // Country code (ISO Alpha-2)
            'country_name' => $countryDetails['name']['common']
        ];

        // Output the results as JSON
        echo json_encode($countryData);
    } else {
        echo json_encode(['error' => "No data found for ISO code: $isoCode."]);
    }
} else {
    echo json_encode(['error' => "Please provide an ISO code parameter."]);
}
