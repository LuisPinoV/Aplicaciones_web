<?php
// Simple script to test DB and Backend health for the Laravel project.

function parseEnv($path) {
    $data = [];
    if (!is_file($path)) return $data;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (strpos($line, '=') === false) continue;
        list($key, $val) = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val);
        // Remove surrounding quotes
        if ((strlen($val) >= 2) && (($val[0] === '"' && $val[strlen($val)-1] === '"') || ($val[0] === "'" && $val[strlen($val)-1] === "'"))) {
            $val = substr($val, 1, -1);
        }
        $data[$key] = $val;
    }
    return $data;
}

$env = parseEnv(__DIR__ . '/../.env');

echo "-- Laravel connection quick check --\n";

// Backend health
$backend = $env['BACKEND_URL'] ?? ($env['BACKEND_API_BASE_URL'] ?? null);
if ($backend) {
    $healthUrl = rtrim($backend, '/') . '/health';
    echo "Checking backend health at: $healthUrl\n";
    $context = stream_context_create(['http' => ['timeout' => 10]]);
    $resp = @file_get_contents($healthUrl, false, $context);
    if ($resp === false) {
        echo "Backend health check failed (no response)\n";
    } else {
        echo "Backend response:\n";
        echo $resp . "\n";
    }
} else {
    echo "No BACKEND_URL or BACKEND_API_BASE_URL found in .env\n";
}

// DB connection test
$dbHost = $env['DB_HOST'] ?? null;
$dbPort = $env['DB_PORT'] ?? 3306;
$dbName = $env['DB_DATABASE'] ?? null;
$dbUser = $env['DB_USERNAME'] ?? null;
$dbPass = $env['DB_PASSWORD'] ?? null;

if ($dbHost && $dbName && $dbUser) {
    echo "\nChecking DB connection to $dbHost:$dbPort (database: $dbName) ...\n";
    try {
        $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
        $opts = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5,
        ];
        $pdo = new PDO($dsn, $dbUser, $dbPass, $opts);
        $row = $pdo->query('SELECT VERSION() AS ver')->fetch();
        echo "DB connected. MySQL version: " . ($row['ver'] ?? 'unknown') . "\n";
        // list tables first 10
        $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
        echo "Tables found: " . count($tables) . "\n";
        $sample = array_slice($tables, 0, 10);
        foreach ($sample as $t) echo " - " . $t[0] . "\n";
    } catch (Throwable $e) {
        echo "DB connection failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "DB credentials (DB_HOST/DB_DATABASE/DB_USERNAME) not found in .env\n";
}

echo "\n-- done --\n";
