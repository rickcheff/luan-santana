<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'erro' => 'Metodo nao permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
if (!is_array($dados)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'erro' => 'Dados invalidos.']);
    exit;
}

$nome     = trim($dados['nome'] ?? $dados['name'] ?? '');
$email    = trim($dados['email'] ?? '');
$telefone = preg_replace('/[^0-9]/', '', $dados['telefone'] ?? $dados['phone'] ?? '');
if (strlen($telefone) > 9) $telefone = substr($telefone, -9);
$valor    = (float)($dados['valor'] ?? $dados['value'] ?? 0);

$erros = [];
if ($nome === '')                                              $erros[] = 'Nome e obrigatorio.';
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL))     $erros[] = 'Email invalido.';
if (strlen($telefone) !== 9 || $telefone[0] !== '9')          $erros[] = 'Numero MB Way invalido (9 digitos, comecar por 9).';
if ($valor < 0.50)                                            $erros[] = 'Valor invalido.';

if (!empty($erros)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'erro' => implode(' ', $erros)]);
    exit;
}

$payload = [
    'amount'             => round($valor, 2),
    'method'             => 'mbway',
    'payer'              => [
        'name'     => $nome,
        'email'    => $email,
        'document' => '',
        'phone'    => $telefone,
    ],
    'paymentDescription' => TAXA_DESCRICAO,
    'currency'           => 'EUR',
    'client_id'          => WAYMB_CLIENT_ID,
    'client_secret'      => WAYMB_CLIENT_SECRET,
    'account_email'      => WAYMB_ACCOUNT_EMAIL,
];

$ch = curl_init(WAYMB_CREATE_URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_SSL_VERIFYPEER => false,
]);
$resposta   = curl_exec($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErro   = curl_error($ch);
curl_close($ch);

if ($curlErro) {
    http_response_code(502);
    echo json_encode(['success' => false, 'erro' => 'Falha ao conectar com o gateway de pagamento.']);
    exit;
}

$data = json_decode($resposta, true);
$txId = $data['transactionID'] ?? $data['transactionId'] ?? $data['id'] ?? null;

if (!$txId) {
    $msg = $data['message'] ?? $data['error'] ?? 'Erro ao processar pagamento.';
    http_response_code(502);
    echo json_encode(['success' => false, 'erro' => $msg]);
    exit;
}

echo json_encode([
    'success'      => true,
    'payment_code' => $txId,
    'status'       => 'pending',
    'data'         => ['id' => $txId, 'status' => 'pending', 'valor' => number_format($valor, 2, '.', '')],
], JSON_UNESCAPED_UNICODE);
