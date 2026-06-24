<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$code = preg_replace('/[^a-zA-Z0-9_\-]/', '', trim($_GET['code'] ?? $_GET['id'] ?? ''));
if ($code === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Codigo nao informado.']);
    exit;
}

$ch = curl_init(WAYMB_INFO_URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode(['id' => $code]),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => false,
]);
$resposta = curl_exec($ch);
$curlErro = curl_error($ch);
@curl_close($ch);

if ($curlErro) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Falha de ligacao.']);
    exit;
}

$data   = json_decode($resposta, true);
$status = $data['status'] ?? '';
$mapped = match(strtoupper($status)) {
    'COMPLETED' => 'approved',
    'DECLINED', 'EXPIRED' => strtolower($status),
    default => 'pending',
};

echo json_encode([
    'success' => true,
    'data'    => ['id' => $code, 'status' => $mapped],
], JSON_UNESCAPED_UNICODE);
