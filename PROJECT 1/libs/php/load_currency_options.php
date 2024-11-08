<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// API endpoint for currency codes
$url = "https://v6.exchangerate-api.com/v6/65c3f72b5722c75e5a932a6d/codes";

// Send request to the API
$response = file_get_contents($url);

// Check if the API response was successful
if ($response === FALSE) {
    echo json_encode(['error' => 'Error fetching currency codes']);
    exit;
}

// Decode the JSON response
$data = json_decode($response, true);

// Check if currency codes are available in the response
if (isset($data['supported_codes'])) {
    // Extract currency codes into a list
    $currencyCodes = array_map(function($codeInfo) {
        return $codeInfo[0]; // Each entry is [code, description], so we take the code only
    }, $data['supported_codes']);

    // Send the currency codes back as a JSON response
    echo json_encode(['currencies' => $currencyCodes]);
} else {
    echo json_encode(['error' => 'Failed to load currency data']);
}

