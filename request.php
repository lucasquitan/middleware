<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Allow both GET and POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Only GET and POST requests are supported.']);
    exit();
}

// Get input data - try JSON body first, then query parameters
$data = null;
$input = file_get_contents('php://input');

if (!empty($input)) {
    // Try to parse JSON from request body
    $data = json_decode($input, true);
} else {
    // If no body, try to get from query parameters (for GET requests)
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_GET)) {
        $data = $_GET;
        
        // If method is in query params, convert to uppercase
        if (isset($data['method'])) {
            $data['method'] = strtoupper($data['method']);
        }
        
        // Try to parse body and headers if they're JSON strings
        if (isset($data['body']) && is_string($data['body'])) {
            $parsedBody = json_decode($data['body'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['body'] = $parsedBody;
            }
        }
        
        if (isset($data['headers']) && is_string($data['headers'])) {
            $parsedHeaders = json_decode($data['headers'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['headers'] = $parsedHeaders;
            }
        }
    }
}

// If no data found
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'No data provided. Send JSON body or use query parameters.']);
    exit();
}

// Validate required fields
if (!isset($data['url']) || !isset($data['method'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: url and method']);
    exit();
}

$url = $data['url'];
$method = strtoupper($data['method']);
$body = $data['body'] ?? null;
$headers = $data['headers'] ?? [];

// Validate URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid URL provided']);
    exit();
}

// Validate HTTP method
$allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
if (!in_array($method, $allowedMethods)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid HTTP method. Allowed methods: ' . implode(', ', $allowedMethods)]);
    exit();
}

try {
    // Initialize cURL
    $ch = curl_init();
    
    // Set basic cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'RequestAPI/1.0');
    
    // Set HTTP method
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    // Set headers if provided
    $formattedHeaders = [];
    if (!empty($headers) && is_array($headers)) {
        foreach ($headers as $key => $value) {
            $formattedHeaders[] = "$key: $value";
        }
    }
    
    // Set body for methods that support it
    if (in_array($method, ['POST', 'PUT', 'PATCH']) && $body !== null) {
        if (is_array($body)) {
            $body = json_encode($body);
            if (!isset($headers['Content-Type'])) {
                $formattedHeaders[] = 'Content-Type: application/json';
            }
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    // Apply headers
    if (!empty($formattedHeaders)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $formattedHeaders);
    }
    
    // Execute the request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    if ($error) {
        throw new Exception("cURL Error: " . $error);
    }
    
    // Split response into headers and body
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $responseHeaders = substr($response, 0, $headerSize);
    $responseBody = substr($response, $headerSize);
    
    // Try to decode JSON response
    $decodedBody = json_decode($responseBody, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $responseBody = $decodedBody;
    }
    
    curl_close($ch);
    
    // Always return HTTP 200 success, but include original response details
    $responseData = [
        'success' => true,
        'status_code' => $httpCode,
        'response_body' => $responseBody,
    ];
    http_response_code(200);
    echo json_encode($responseData);
    return;
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
