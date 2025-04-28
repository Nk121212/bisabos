<?php

var_dump($_SERVER['REQUEST_METHOD']);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Proses data login di sini
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // ... logika autentikasi ...

    $response = ['status' => 'success', 'token' => generateRandomString(32)];
    echo json_encode($response);
} else {
    // Jika bukan metode POST, kirim error 405
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
?>