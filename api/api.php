<?php
/**
 * PLATANIK — серверна частина магазину (один файл, без залежностей).
 * Потрібно: PHP 7.4+ з PDO SQLite. Дані: api/storage/shop.sqlite (створюється сам).
 * Налаштування: скопіюйте config.sample.php у config.php і заповніть.
 *
 * Виклик: api.php?a=<дія>. Читання — GET, зміни — POST з JSON і заголовком X-Requested-With: platanik.
 */
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');

$CFG = [
    'admin_password'   => '',            // пароль адмінки; порожній = адмінка вимкнена
    'order_prefix'     => 'PL',
    'telegram_token'   => '',            // токен бота для сповіщень про замовлення
    'telegram_chat'    => '',            // ID чату/групи менеджерів
    'notify_email'     => '',            // e-mail для копії замовлення
    'keycrm_token'     => '',            // API-ключ KeyCRM; порожній = не надсилати
    'keycrm_source_id' => 0,             // ID джерела замовлень у KeyCRM
    'np_key'           => '',            // API-ключ Нової Пошти: довідник міст/відділень у checkout (ключ лишається на сервері)
    'default_opt_discount' => 0,         // знижка % для нового оптового клієнта після підтвердження
    'storage'          => __DIR__ . '/storage',
    'catalog'          => __DIR__ . '/../data/catalog.json',
];
if (is_file(__DIR__ . '/config.php')) { $CFG = array_merge($CFG, (array) require __DIR__ . '/config.php'); }
// База, оптовий прайс і журнал лежать у папці з випадковою назвою: її не вгадати, навіть якщо сервер (nginx) не читає .htaccess.
if (!is_dir($CFG['storage'])) { @mkdir($CFG['storage'], 0750, true); }
if (!is_file($CFG['storage'] . '/key.php')) {
    @file_put_contents($CFG['storage'] . '/key.php', "<?php return '" . bin2hex(random_bytes(16)) . "';\n");
    @file_put_contents($CFG['storage'] . '/index.html', '');
    @file_put_contents($CFG['storage'] . '/.htaccess', "Require all denied\nDeny from all\n");
}
if (!is_file($CFG['storage'] . '/key.php')) { http_response_code(500); echo json_encode(['ok' => false, 'error' => 'storage', 'message' => 'Папка api/storage недоступна для запису.']); exit; }
$CFG['storage'] .= '/' . preg_replace('/[^a-f0-9]/', '', (string) require $CFG['storage'] . '/key.php');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out($data, int $code = 200): void { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function fail(string $code, string $msg = '', int $http = 400): void { out(['ok' => false, 'error' => $code, 'message' => $msg], $http); }
function str($v, int $max = 200): string { return mb_substr(trim((string) ($v ?? '')), 0, $max); }
function phone_key(string $p): string { $d = preg_replace('/\D+/', '', $p); return strlen($d) >= 10 ? substr($d, -10) : ''; }

/* ---------- storage ---------- */
function db(): PDO {
    static $pdo = null; global $CFG;
    if ($pdo) return $pdo;
    $dir = $CFG['storage'];
    if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
    if (!is_file("$dir/.htaccess")) { @file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n"); }
    if (!is_file("$dir/index.html")) { @file_put_contents("$dir/index.html", ''); }
    $pdo = new PDO('sqlite:' . $dir . '/shop.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=4000;');
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, type TEXT, role TEXT, phone TEXT UNIQUE, phone_raw TEXT, email TEXT, pass TEXT,
        first TEXT, last TEXT, company TEXT, edrpou TEXT, city TEXT, addr TEXT, discount REAL DEFAULT 0, note TEXT DEFAULT '', data TEXT DEFAULT '{}', created TEXT);
      CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, no TEXT, user_id INTEGER, created TEXT, status TEXT, total REAL, qty INTEGER, payload TEXT);
      CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY, created TEXT, kind TEXT, name TEXT, phone TEXT, product_id INTEGER, text TEXT, done INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, product_id INTEGER, user_id INTEGER, name TEXT, stars INTEGER, text TEXT, created TEXT, status TEXT);
      CREATE TABLE IF NOT EXISTS throttle (k TEXT, ts INTEGER);
      CREATE INDEX IF NOT EXISTS i_orders_user ON orders(user_id); CREATE INDEX IF NOT EXISTS i_rev_prod ON reviews(product_id, status);");
    return $pdo;
}
function q(string $sql, array $p = []): PDOStatement { $st = db()->prepare($sql); $st->execute($p); return $st; }
function throttle(string $key, int $max, int $window): void {
    $k = $key . '|' . ($_SERVER['REMOTE_ADDR'] ?? '-'); $now = time();
    q('DELETE FROM throttle WHERE ts < ?', [$now - 3600]);
    $n = (int) q('SELECT COUNT(*) FROM throttle WHERE k = ? AND ts > ?', [$k, $now - $window])->fetchColumn();
    if ($n >= $max) fail('too_many', 'Забагато спроб. Спробуйте за кілька хвилин.', 429);
    q('INSERT INTO throttle (k, ts) VALUES (?, ?)', [$k, $now]);
}

/* ---------- catalog & prices ---------- */
function catalog(): array {
    static $c = null; global $CFG;
    if ($c !== null) return $c;
    $c = ['items' => [], 'wh' => []];
    if (is_file($CFG['catalog'])) {
        $d = json_decode((string) file_get_contents($CFG['catalog']), true) ?: [];
        $c['wh'] = $d['wh'] ?? [];
        foreach (($d['items'] ?? []) as $it) { $c['items'][(int) $it['id']] = $it; }
    }
    return $c;
}
function opt_prices(): array {
    static $p = null; global $CFG;
    if ($p !== null) return $p;
    $f = $CFG['storage'] . '/opt-prices.json';
    $p = is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
    return $p;
}
function price_for(array $it, ?array $u): float {
    $retail = (float) $it['p'];
    if (!$u || $u['role'] !== 'opt') return $retail;
    $op = opt_prices(); $id = (string) $it['id'];
    if (isset($op[$id]) && $op[$id] > 0) return round((float) $op[$id], 2);
    $disc = max(0.0, min(60.0, (float) $u['discount']));
    return round($retail * (1 - $disc / 100), 2);
}

/* ---------- session & users ---------- */
function boot_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('plsid');
    session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 30, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax', 'secure' => $secure]);
    session_start();
}
function current_user(): ?array {
    boot_session();
    if (empty($_SESSION['uid'])) return null;
    $u = q('SELECT * FROM users WHERE id = ?', [(int) $_SESSION['uid']])->fetch();
    if (!$u || $u['role'] === 'blocked') { unset($_SESSION['uid']); return null; }
    return $u;
}
function public_user(?array $u): ?array {
    if (!$u) return null;
    $data = json_decode($u['data'] ?: '{}', true) ?: [];
    return ['id' => (int) $u['id'], 'type' => $u['type'], 'role' => $u['role'], 'phone' => $u['phone_raw'], 'email' => $u['email'], 'first' => $u['first'], 'last' => $u['last'],
        'company' => $u['company'], 'edrpou' => $u['edrpou'], 'city' => $u['city'], 'addr' => $u['addr'], 'discount' => (float) $u['discount'],
        'hasPriceList' => $u['role'] === 'opt' && count(opt_prices()) > 0, 'tpls' => $data['tpls'] ?? [], 'fav' => $data['fav'] ?? []];
}
function need_user(): array { $u = current_user(); if (!$u) fail('auth', 'Увійдіть до кабінету.', 401); return $u; }
function is_admin(): bool { boot_session(); return !empty($_SESSION['admin']); }
function need_admin(): void { if (!is_admin()) fail('admin', 'Потрібен вхід адміністратора.', 401); }
function body(): array {
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'platanik') fail('csrf', 'Некоректний запит.', 403);
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 200000) fail('too_large', '', 413);
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

/* ---------- notifications ---------- */
function http_post(string $url, array $headers, string $payload, int $timeout = 6): ?string {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload, CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout, CURLOPT_CONNECTTIMEOUT => 4]);
        $r = curl_exec($ch); curl_close($ch);
        return $r === false ? null : (string) $r;
    }
    $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\r\n", $headers), 'content' => $payload, 'timeout' => $timeout, 'ignore_errors' => true]]);
    $r = @file_get_contents($url, false, $ctx);
    return $r === false ? null : $r;
}
function log_line(string $s): void { global $CFG; @file_put_contents($CFG['storage'] . '/log.txt', date('c') . ' ' . $s . "\n", FILE_APPEND); }
function notify(string $text): void {
    global $CFG;
    if ($CFG['telegram_token'] && $CFG['telegram_chat']) {
        $r = http_post('https://api.telegram.org/bot' . $CFG['telegram_token'] . '/sendMessage', ['Content-Type: application/json'],
            json_encode(['chat_id' => $CFG['telegram_chat'], 'text' => mb_substr($text, 0, 3900), 'disable_web_page_preview' => true]));
        if ($r === null || strpos($r, '"ok":true') === false) log_line('telegram fail ' . substr((string) $r, 0, 200));
    }
    if ($CFG['notify_email']) {
        $subj = '=?UTF-8?B?' . base64_encode(strtok($text, "\n")) . '?=';
        @mail($CFG['notify_email'], $subj, $text, "Content-Type: text/plain; charset=utf-8\r\n");
    }
}
function keycrm_order(array $o): void {
    global $CFG;
    if (!$CFG['keycrm_token']) return;
    $products = [];
    foreach ($o['items'] as $l) { $products[] = ['sku' => $l['cc'] ?: (string) $l['id'], 'name' => $l['n'], 'price' => $l['price'], 'quantity' => $l['q'], 'comment' => 'Склад: ' . $l['whName']]; }
    $c = $o['contact']; $d = $o['delivery'];
    $payload = ['source_id' => (int) $CFG['keycrm_source_id'], 'source_uuid' => $o['no'], 'buyer_comment' => $o['comment'],
        'manager_comment' => 'Сайт: ' . $o['no'] . ' · ' . $d['label'] . ' · ' . $o['payLabel'] . ($o['opt'] ? ' · ОПТ' : ''),
        'buyer' => ['full_name' => trim($c['first'] . ' ' . $c['last']), 'phone' => $c['phone'], 'email' => $c['email'] ?: null],
        'shipping' => ['shipping_address_city' => $d['city'], 'shipping_receive_point' => $d['branch'], 'shipping_secondary_line' => $d['addr'],
            'recipient_full_name' => $d['rname'] ?: trim($c['first'] . ' ' . $c['last']), 'recipient_phone' => $d['rphone'] ?: $c['phone']],
        'products' => $products];
    $r = http_post('https://openapi.keycrm.app/v1/order', ['Content-Type: application/json', 'Accept: application/json', 'Authorization: Bearer ' . $CFG['keycrm_token']], json_encode($payload, JSON_UNESCAPED_UNICODE));
    if ($r === null || strpos($r, '"id"') === false) log_line('keycrm fail ' . $o['no'] . ' ' . substr((string) $r, 0, 300));
}

/* ---------- routes ---------- */
$a = (string) ($_GET['a'] ?? '');
try {
switch ($a) {

case 'ping':
    out(['ok' => true, 'user' => public_user(current_user()), 'admin' => is_admin()]);

case 'register': {
    $b = body(); throttle('reg', 8, 3600);
    $type = in_array($b['type'] ?? '', ['fiz', 'fop', 'ur'], true) ? $b['type'] : 'fiz';
    $key = phone_key(str($b['phone'] ?? '')); $pass = (string) ($b['password'] ?? '');
    if ($key === '') fail('phone', 'Вкажіть номер у форматі +380XXXXXXXXX.');
    if (strlen($pass) < 6) fail('password', 'Пароль — щонайменше 6 символів.');
    if (str($b['first'] ?? '') === '') fail('first', "Вкажіть ім'я.");
    if ($type !== 'fiz' && (str($b['company'] ?? '') === '' || str($b['edrpou'] ?? '') === '')) fail('company', 'Вкажіть назву та код ЄДРПОУ/ІПН.');
    if (q('SELECT 1 FROM users WHERE phone = ?', [$key])->fetch()) fail('exists', 'Акаунт з таким телефоном уже є. Увійдіть.');
    $em = mb_strtolower(str($b['email'] ?? '')); if ($em !== '' && q("SELECT 1 FROM users WHERE lower(email) = ?", [$em])->fetch()) fail('exists', 'Акаунт з таким e-mail уже є. Увійдіть.');
    q('INSERT INTO users (type, role, phone, phone_raw, email, pass, first, last, company, edrpou, city, addr, created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [$type, $type === 'fiz' ? 'retail' : 'opt_pending', $key, str($b['phone']), str($b['email'] ?? ''), password_hash($pass, PASSWORD_DEFAULT), str($b['first']), str($b['last'] ?? ''),
         str($b['company'] ?? ''), str($b['edrpou'] ?? '', 20), str($b['city'] ?? ''), str($b['addr'] ?? '', 300), date('c')]);
    boot_session(); session_regenerate_id(true); $_SESSION['uid'] = (int) db()->lastInsertId();
    if ($type !== 'fiz') notify("Новий оптовий клієнт чекає підтвердження\n" . str($b['company']) . ', ' . str($b['edrpou'] ?? '') . "\n" . str($b['first']) . ' ' . str($b['last'] ?? '') . ', ' . str($b['phone']));
    out(['ok' => true, 'user' => public_user(current_user())]);
}

case 'login': {
    $b = body(); throttle('login', 10, 600);
    $login = str($b['login'] ?? ($b['phone'] ?? ($b['email'] ?? ''))); $pk = phone_key($login);
    $u = strpos($login, '@') !== false ? q("SELECT * FROM users WHERE email <> '' AND lower(email) = ?", [mb_strtolower($login)])->fetch() : ($pk !== '' ? q('SELECT * FROM users WHERE phone = ?', [$pk])->fetch() : false);
    if (!$u || !password_verify((string) ($b['password'] ?? ''), $u['pass'])) fail('creds', 'Невірний логін або пароль.', 401);
    if ($u['role'] === 'blocked') fail('blocked', 'Акаунт заблоковано. Зверніться до менеджера.', 403);
    boot_session(); session_regenerate_id(true); $_SESSION['uid'] = (int) $u['id'];
    out(['ok' => true, 'user' => public_user($u)]);
}

case 'logout':
    body(); boot_session(); unset($_SESSION['uid']);
    out(['ok' => true]);

case 'profile': {
    $b = body(); $u = need_user();
    $f = [];
    foreach (['first', 'last', 'email', 'company', 'city'] as $k) if (isset($b[$k])) $f[$k] = str($b[$k]);
    if (isset($b['addr'])) $f['addr'] = str($b['addr'], 300);
    if (isset($b['edrpou']) && $u['role'] !== 'opt') $f['edrpou'] = str($b['edrpou'], 20);   // після підтвердження код змінює менеджер
    $data = json_decode($u['data'] ?: '{}', true) ?: [];
    if (isset($b['tpls']) && is_array($b['tpls'])) $data['tpls'] = array_slice(array_map(fn($t) => array_map(fn($v) => str($v, 200), array_intersect_key((array) $t, array_flip(['name', 'dv', 'city', 'branch', 'addr', 'rname', 'rphone']))), $b['tpls']), 0, 30);
    if (isset($b['fav']) && is_array($b['fav'])) $data['fav'] = array_slice(array_values(array_unique(array_map('intval', $b['fav']))), 0, 500);
    $f['data'] = json_encode($data, JSON_UNESCAPED_UNICODE);
    if (!empty($b['password'])) { if (strlen((string) $b['password']) < 6) fail('password', 'Пароль — щонайменше 6 символів.'); $f['pass'] = password_hash((string) $b['password'], PASSWORD_DEFAULT); }
    q('UPDATE users SET ' . implode(', ', array_map(fn($k) => "$k = ?", array_keys($f))) . ' WHERE id = ?', [...array_values($f), $u['id']]);
    out(['ok' => true, 'user' => public_user(current_user())]);
}

case 'prices': {   // оптові ціни — тільки підтвердженим оптовим клієнтам
    $u = need_user();
    if ($u['role'] !== 'opt') out(['ok' => true, 'role' => $u['role'], 'discount' => 0, 'prices' => new stdClass()]);
    $op = opt_prices();
    out(['ok' => true, 'role' => 'opt', 'discount' => (float) $u['discount'], 'prices' => $op ?: new stdClass()]);
}

case 'order': {
    $b = body(); throttle('order', 20, 3600); $u = current_user(); $cat = catalog();
    $c = (array) ($b['contact'] ?? []); $d = (array) ($b['delivery'] ?? []);
    $contact = ['first' => str($c['first'] ?? ''), 'last' => str($c['last'] ?? ''), 'phone' => str($c['phone'] ?? '', 30), 'email' => str($c['email'] ?? ''), 'company' => str($c['company'] ?? '')];
    if ($contact['first'] === '' || phone_key($contact['phone']) === '') fail('contact', "Вкажіть ім'я та телефон.");
    $deliv = ['dv' => str($d['dv'] ?? '', 10), 'label' => str($d['label'] ?? ''), 'city' => str($d['city'] ?? ''), 'branch' => str($d['branch'] ?? ''), 'addr' => str($d['addr'] ?? '', 300),
        'rname' => str($d['rname'] ?? ''), 'rphone' => str($d['rphone'] ?? '', 30), 'cod' => (float) ($d['cod'] ?? 0)];
    if ($deliv['dv'] === 'drop' && (!$u || $u['role'] !== 'opt')) fail('drop', 'Дропшипінг доступний підтвердженим оптовим клієнтам.');
    $items = []; $total = 0.0; $qty = 0;
    foreach (array_slice((array) ($b['items'] ?? []), 0, 300) as $l) {
        $id = (int) ($l['id'] ?? 0); $n = max(1, min(9999, (int) ($l['q'] ?? 0))); $wh = (int) ($l['wh'] ?? 0);
        if (!isset($cat['items'][$id])) continue;
        $it = $cat['items'][$id]; $pr = price_for($it, $u);
        $items[] = ['id' => $id, 'cc' => $it['cc'] ?? '', 'n' => $it['n'], 'q' => $n, 'wh' => $wh, 'whName' => $cat['wh'][$wh] ?? '', 'price' => $pr, 'retail' => (float) $it['p'], 'sum' => round($pr * $n, 2)];
        $total += $pr * $n; $qty += $n;
    }
    if (!$items) fail('empty', 'Кошик порожній або товари вже недоступні.');
    $pay = in_array($b['pay'] ?? '', ['card', 'inv', 'cod'], true) ? $b['pay'] : 'cod';
    $payLabel = ['card' => 'Оплата картою онлайн', 'inv' => 'Оплата на розрахунковий рахунок', 'cod' => 'Оплата при отриманні'][$pay];
    $o = ['contact' => $contact, 'delivery' => $deliv, 'pay' => $pay, 'payLabel' => $payLabel, 'comment' => str($b['comment'] ?? '', 1000), 'items' => $items,
        'opt' => $u && $u['role'] === 'opt', 'edrpou' => $u['edrpou'] ?? '', 'lang' => str($b['lang'] ?? 'ua', 2)];
    $total = round($total, 2);
    db()->beginTransaction();
    q('INSERT INTO orders (no, user_id, created, status, total, qty, payload) VALUES (?,?,?,?,?,?,?)', ['', $u['id'] ?? null, date('c'), 'new', $total, $qty, '']);
    $oid = (int) db()->lastInsertId(); global $CFG;
    $o['no'] = $CFG['order_prefix'] . '-' . date('ymd') . '-' . str_pad((string) $oid, 4, '0', STR_PAD_LEFT);
    q('UPDATE orders SET no = ?, payload = ? WHERE id = ?', [$o['no'], json_encode($o, JSON_UNESCAPED_UNICODE), $oid]);
    db()->commit();
    $lines = ["Замовлення {$o['no']}" . ($o['opt'] ? ' · ОПТ' : ''), trim("{$contact['first']} {$contact['last']}") . ", {$contact['phone']}" . ($contact['company'] ? ", {$contact['company']}" : '') . ($o['edrpou'] ? ", код {$o['edrpou']}" : ''),
        'Доставка: ' . implode(', ', array_filter([$deliv['label'], $deliv['city'], $deliv['branch'], $deliv['addr']])) . ($deliv['dv'] === 'drop' ? " · отримувач {$deliv['rname']} {$deliv['rphone']}" . ($deliv['cod'] ? ", НП {$deliv['cod']} грн" : '') : ''),
        'Оплата: ' . $payLabel, ''];
    foreach ($items as $i => $l) $lines[] = ($i + 1) . '. ' . ($l['cc'] ? $l['cc'] . ' · ' : '') . $l['n'] . " — {$l['q']} шт × " . number_format($l['price'], 2, '.', '') . " = " . number_format($l['sum'], 2, '.', '') . " грн [{$l['whName']}]";
    $lines[] = ''; $lines[] = 'Разом: ' . number_format($total, 2, '.', '') . " грн ($qty шт)";
    if ($o['comment']) { $lines[] = 'Коментар: ' . $o['comment']; }
    notify(implode("\n", $lines)); keycrm_order($o);
    out(['ok' => true, 'no' => $o['no'], 'total' => $total, 'qty' => $qty, 'text' => implode("\n", $lines)]);
}

case 'orders': {
    $u = need_user(); $res = [];
    foreach (q('SELECT no, created, status, total, qty, payload FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 200', [$u['id']]) as $r) {
        $p = json_decode($r['payload'], true) ?: [];
        $res[] = ['no' => $r['no'], 'date' => $r['created'], 'status' => $r['status'], 'sum' => (float) $r['total'], 'n' => (int) $r['qty'], 'items' => $p['items'] ?? [], 'delivery' => $p['delivery'] ?? [], 'payLabel' => $p['payLabel'] ?? '', 'comment' => $p['comment'] ?? ''];
    }
    out(['ok' => true, 'orders' => $res]);
}

case 'lead': {
    $b = body(); throttle('lead', 15, 3600);
    $phone = str($b['phone'] ?? '', 30); if (phone_key($phone) === '') fail('phone', 'Вкажіть номер телефону.');
    $kind = in_array($b['kind'] ?? '', ['oneclick', 'notify', 'callback', 'question'], true) ? $b['kind'] : 'callback';
    $pid = (int) ($b['product'] ?? 0); $it = catalog()['items'][$pid] ?? null;
    q('INSERT INTO leads (created, kind, name, phone, product_id, text) VALUES (?,?,?,?,?,?)', [date('c'), $kind, str($b['name'] ?? ''), $phone, $pid ?: null, str($b['text'] ?? '', 1000)]);
    $title = ['oneclick' => 'Купити в один клік', 'notify' => 'Повідомити про надходження', 'callback' => 'Передзвонити', 'question' => 'Питання з сайту'][$kind];
    notify($title . "\n" . str($b['name'] ?? '') . ' ' . $phone . ($it ? "\n" . (($it['cc'] ?? '') ? $it['cc'] . ' · ' : '') . $it['n'] . ' — ' . $it['p'] . ' грн' : '') . (str($b['text'] ?? '') !== '' ? "\n" . str($b['text'], 1000) : ''));
    out(['ok' => true]);
}

case 'np': {
    // Nova Poshta directory proxy: only two read-only directory calls, the company key never reaches the browser
    $b = body(); throttle('np', 300, 3600);
    $m = $b['m'] ?? '';
    if ($m === 'cities') { $req = ['modelName' => 'Address', 'calledMethod' => 'searchSettlements', 'methodProperties' => ['CityName' => str($b['q'] ?? '', 60), 'Limit' => '20', 'Page' => '1']]; }
    elseif ($m === 'whs') { $ref = preg_replace('/[^a-f0-9-]/i', '', (string) ($b['city'] ?? '')); if ($ref === '') fail('city', 'city'); $req = ['modelName' => 'Address', 'calledMethod' => 'getWarehouses', 'methodProperties' => ['CityRef' => $ref, 'FindByString' => str($b['q'] ?? '', 60), 'Limit' => '60', 'Page' => '1']]; }
    else fail('m', 'unknown');
    $req['apiKey'] = (string) ($CFG['np_key'] ?? '');
    $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode($req, JSON_UNESCAPED_UNICODE), 'timeout' => 8]]);
    $raw = @file_get_contents('https://api.novaposhta.ua/v2.0/json/', false, $ctx);
    $j = $raw ? json_decode($raw, true) : null;
    if (!$j || empty($j['success'])) fail('np', 'Нова Пошта не відповідає.');
    out(['ok' => true, 'data' => $j['data']]);
}

case 'reviews': {
    $pid = (int) ($_GET['product'] ?? 0);
    out(['ok' => true, 'reviews' => q("SELECT name AS n, stars AS s, text AS t, substr(created, 1, 10) AS d FROM reviews WHERE product_id = ? AND status = 'ok' ORDER BY id DESC LIMIT 100", [$pid])->fetchAll()]);
}
case 'review': {
    $b = body(); throttle('review', 6, 3600); $u = current_user();
    $pid = (int) ($b['product'] ?? 0); $text = str($b['text'] ?? '', 2000); $name = str($b['name'] ?? '', 60);
    if (!isset(catalog()['items'][$pid]) || $text === '' || $name === '') fail('review', "Вкажіть ім'я та текст відгуку.");
    q('INSERT INTO reviews (product_id, user_id, name, stars, text, created, status) VALUES (?,?,?,?,?,?,?)', [$pid, $u['id'] ?? null, $name, max(1, min(5, (int) ($b['stars'] ?? 5))), $text, date('c'), 'new']);
    notify("Новий відгук на модерацію\n$name: $text");
    out(['ok' => true, 'moderation' => true]);
}

/* ----- адмінка ----- */
case 'admin.login': {
    $b = body(); throttle('admin', 6, 900); global $CFG;
    if ($CFG['admin_password'] === '' || !hash_equals((string) $CFG['admin_password'], (string) ($b['password'] ?? ''))) fail('creds', 'Невірний пароль.', 401);
    boot_session(); session_regenerate_id(true); $_SESSION['admin'] = 1;
    out(['ok' => true]);
}
case 'admin.logout': body(); boot_session(); unset($_SESSION['admin']); out(['ok' => true]);
case 'admin.data': {
    need_admin();
    $users = q('SELECT id, type, role, phone_raw AS phone, email, first, last, company, edrpou, city, addr, discount, note, created FROM users ORDER BY (role = \'opt_pending\') DESC, id DESC LIMIT 2000')->fetchAll();
    $orders = [];
    foreach (q('SELECT id, no, user_id, created, status, total, qty, payload FROM orders ORDER BY id DESC LIMIT 500') as $r) { $r['payload'] = json_decode($r['payload'], true); $orders[] = $r; }
    out(['ok' => true, 'users' => $users, 'orders' => $orders,
        'leads' => q('SELECT * FROM leads ORDER BY id DESC LIMIT 500')->fetchAll(), 'reviews' => q('SELECT * FROM reviews ORDER BY id DESC LIMIT 500')->fetchAll(),
        'optPrices' => count(opt_prices()), 'catalogItems' => count(catalog()['items'])]);
}
case 'admin.user': {
    $b = body(); need_admin(); $id = (int) ($b['id'] ?? 0);
    $u = q('SELECT * FROM users WHERE id = ?', [$id])->fetch(); if (!$u) fail('nf', '', 404);
    $role = in_array($b['role'] ?? '', ['retail', 'opt_pending', 'opt', 'blocked'], true) ? $b['role'] : $u['role'];
    global $CFG; $disc = isset($b['discount']) ? max(0.0, min(60.0, (float) $b['discount'])) : (float) $u['discount'];
    if ($role === 'opt' && $u['role'] !== 'opt' && !isset($b['discount']) && $disc == 0.0) $disc = (float) $CFG['default_opt_discount'];
    q('UPDATE users SET role = ?, discount = ?, note = ? WHERE id = ?', [$role, $disc, str($b['note'] ?? $u['note'], 500), $id]);
    out(['ok' => true]);
}
case 'admin.order': {
    $b = body(); need_admin();
    $st = in_array($b['status'] ?? '', ['new', 'confirmed', 'shipped', 'done', 'canceled'], true) ? $b['status'] : 'new';
    q('UPDATE orders SET status = ? WHERE id = ?', [$st, (int) ($b['id'] ?? 0)]);
    out(['ok' => true]);
}
case 'admin.lead': { $b = body(); need_admin(); q('UPDATE leads SET done = ? WHERE id = ?', [empty($b['done']) ? 0 : 1, (int) ($b['id'] ?? 0)]); out(['ok' => true]); }
case 'admin.review': {
    $b = body(); need_admin();
    if (($b['status'] ?? '') === 'delete') q('DELETE FROM reviews WHERE id = ?', [(int) ($b['id'] ?? 0)]);
    else q('UPDATE reviews SET status = ? WHERE id = ?', [($b['status'] ?? '') === 'ok' ? 'ok' : 'new', (int) ($b['id'] ?? 0)]);
    out(['ok' => true]);
}
case 'admin.optprices': {   // завантаження оптового прайсу: {"prices": {"<id товару>": ціна, ...}} або {"byCode": {"<артикул>": ціна}}
    $b = body(); need_admin(); global $CFG; $res = [];
    foreach ((array) ($b['prices'] ?? []) as $id => $p) if ((float) $p > 0) $res[(string) (int) $id] = round((float) $p, 2);
    if (!empty($b['byCode'])) { $map = []; foreach (catalog()['items'] as $it) if (!empty($it['cc'])) $map[mb_strtoupper(preg_replace('/[\s.\-\/_]/u', '', $it['cc']))] = (string) $it['id'];
        foreach ((array) $b['byCode'] as $code => $p) { $k = mb_strtoupper(preg_replace('/[\s.\-\/_]/u', '', (string) $code)); if (isset($map[$k]) && (float) $p > 0) $res[$map[$k]] = round((float) $p, 2); } }
    file_put_contents($CFG['storage'] . '/opt-prices.json', json_encode($res));
    out(['ok' => true, 'count' => count($res)]);
}

default: fail('unknown', 'Невідома дія.', 404);
}
} catch (Throwable $e) {
    if (db()->inTransaction()) db()->rollBack();
    log_line('error ' . $a . ' ' . $e->getMessage());
    fail('server', 'Помилка сервера. Спробуйте ще раз або зателефонуйте нам.', 500);
}
