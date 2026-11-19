<?php
declare(strict_types=1);

/**
 * Survive the Horde - score API
 * Requires PHP 7.4+ with PDO MySQL, and MySQL 5.7+ / MariaDB 10.3+.
 *
 * Endpoints (all JSON):
 *   POST api.php                         {"action":"submit", run_id, name, champion, time, kills, level}
 *   GET  api.php?action=top&sort=kills|time&limit=20
 *   GET  api.php?action=my&name=PlayerName
 */

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = (int) (getenv('DB_PORT') ?: 3306);
$dbName = getenv('DB_NAME') ?: 'survive_the_horde';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

const CHAMPION_IDS = ['lyra', 'kael', 'ignis', 'vespera'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanName($v): ?string
{
    if (!is_string($v)) {
        return null;
    }
    $v = trim((string) preg_replace('/\s+/u', ' ', $v));
    // 1-16 letters, numbers, spaces, underscore, dash or dot (same rule as the game's name screen)
    if (!preg_match('/^[\p{L}\p{N} _.\-]{1,16}$/u', $v)) {
        return null;
    }
    return $v;
}

function intInRange($v, int $min, int $max): ?int
{
    if (is_int($v)) {
        $n = $v;
    } elseif (is_float($v) && floor($v) == $v) {
        $n = (int) $v;
    } elseif (is_string($v) && ctype_digit($v)) {
        $n = (int) $v;
    } else {
        return null;
    }
    return ($n >= $min && $n <= $max) ? $n : null;
}

function normalizeRows(array $rows): array
{
    return array_map(static function (array $r): array {
        return [
            'name'     => (string) $r['name'],
            'champion' => (string) $r['champion'],
            'time'     => (int) $r['time'],
            'kills'    => (int) $r['kills'],
            'level'    => (int) $r['level'],
            'ts'       => (int) $r['ts'],
        ];
    }, $rows);
}

const SELECT_COLS = 'player_name AS `name`, champion, survival_seconds AS `time`, kills, `level`, UNIX_TIMESTAMP(created_at) AS ts';

// ---------------------------------------------------------------- connect
try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $dbHost, $dbPort, $dbName),
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    // Safe to run every time; schema.sql contains the same definition.
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS scores (
            id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
            run_id           VARCHAR(40)  NOT NULL,
            player_name      VARCHAR(16)  NOT NULL,
            champion         VARCHAR(16)  NOT NULL,
            survival_seconds INT UNSIGNED NOT NULL,
            kills            INT UNSIGNED NOT NULL,
            `level`          SMALLINT UNSIGNED NOT NULL DEFAULT 1,
            created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_run (run_id),
            KEY idx_player (player_name),
            KEY idx_kills (kills, survival_seconds),
            KEY idx_time (survival_seconds, kills)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
} catch (Throwable $e) {
    respond(['ok' => false, 'error' => 'Database connection failed'], 500);
}

// ---------------------------------------------------------------- route
try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'POST') {
        $in = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($in) || ($in['action'] ?? '') !== 'submit') {
            respond(['ok' => false, 'error' => 'Bad request'], 400);
        }

        $runId = $in['run_id'] ?? null;
        $name  = cleanName($in['name'] ?? null);
        $champ = $in['champion'] ?? null;
        $time  = intInRange($in['time'] ?? null, 0, 43200);   // up to 12 hours
        $kills = intInRange($in['kills'] ?? null, 0, 1000000);
        $level = intInRange($in['level'] ?? null, 1, 500);

        if (!is_string($runId) || !preg_match('/^[A-Za-z0-9\-]{8,40}$/', $runId)
            || $name === null
            || !is_string($champ) || !in_array($champ, CHAMPION_IDS, true)
            || $time === null || $kills === null || $level === null) {
            respond(['ok' => false, 'error' => 'Invalid score data'], 400);
        }

        // INSERT IGNORE + unique run_id means a retried request never creates a duplicate.
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO scores (run_id, player_name, champion, survival_seconds, kills, `level`)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$runId, $name, $champ, $time, $kills, $level]);

        $q = $pdo->prepare('SELECT COUNT(*) + 1 FROM scores WHERE kills > ? OR (kills = ? AND survival_seconds > ?)');
        $q->execute([$kills, $kills, $time]);
        $rankKills = (int) $q->fetchColumn();

        $q = $pdo->prepare('SELECT COUNT(*) + 1 FROM scores WHERE survival_seconds > ? OR (survival_seconds = ? AND kills > ?)');
        $q->execute([$time, $time, $kills]);
        $rankTime = (int) $q->fetchColumn();

        respond(['ok' => true, 'rank_kills' => $rankKills, 'rank_time' => $rankTime]);
    }

    $action = $_GET['action'] ?? '';

    if ($action === 'top') {
        $sort  = (($_GET['sort'] ?? 'kills') === 'time') ? 'time' : 'kills';
        $limit = max(1, min(50, (int) ($_GET['limit'] ?? 20)));
        $order = $sort === 'time'
            ? 'survival_seconds DESC, kills DESC, id ASC'
            : 'kills DESC, survival_seconds DESC, id ASC';

        $rows = $pdo->query('SELECT ' . SELECT_COLS . " FROM scores ORDER BY $order LIMIT $limit")->fetchAll();
        respond(['ok' => true, 'rows' => normalizeRows($rows)]);
    }

    if ($action === 'my') {
        $name = cleanName($_GET['name'] ?? null);
        if ($name === null) {
            respond(['ok' => true, 'rows' => [], 'stats' => ['runs' => 0, 'best_kills' => 0, 'best_time' => 0, 'total_kills' => 0]]);
        }

        $stmt = $pdo->prepare('SELECT ' . SELECT_COLS . ' FROM scores WHERE player_name = ? ORDER BY id DESC LIMIT 50');
        $stmt->execute([$name]);
        $rows = normalizeRows($stmt->fetchAll());

        $stmt = $pdo->prepare(
            'SELECT COUNT(*) AS runs,
                    COALESCE(MAX(kills), 0)            AS best_kills,
                    COALESCE(MAX(survival_seconds), 0) AS best_time,
                    COALESCE(SUM(kills), 0)            AS total_kills
             FROM scores WHERE player_name = ?'
        );
        $stmt->execute([$name]);
        $s = $stmt->fetch();

        respond([
            'ok'    => true,
            'rows'  => $rows,
            'stats' => [
                'runs'        => (int) $s['runs'],
                'best_kills'  => (int) $s['best_kills'],
                'best_time'   => (int) $s['best_time'],
                'total_kills' => (int) $s['total_kills'],
            ],
        ]);
    }

    respond(['ok' => false, 'error' => 'Unknown action'], 400);
} catch (Throwable $e) {
    respond(['ok' => false, 'error' => 'Server error'], 500);
}
