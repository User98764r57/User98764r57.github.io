<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];

    // Use GeoNames API to get the country code based on coordinates
    $geoUrl = "http://api.geonames.org/countryCodeJSON?lat={$lat}&lng={$lng}&username=sulyy67694949";
    $geoResponse = file_get_contents($geoUrl);
    $geoData = json_decode($geoResponse, true);

    if (isset($geoData['countryCode'])) {

        // Fetch news data using NewsData API with the built parameters
        $newsApiUrl = "https://newsdata.io/api/1/latest?apikey=pub_58257613859a24185f90e4c846f85236b9037&country={$countryCode}&language=en";
        $newsResponse = file_get_contents($newsApiUrl);
        $newsData = json_decode($newsResponse, true);

        header('Content-Type: application/json');
        echo json_encode($newsData);
    } else {
        echo json_encode(['error' => 'Unable to determine country from coordinates.']);
    }
} else {
    echo json_encode(['error' => 'Coordinates not provided.']);
}
