<?php
// Скопіюйте цей файл у config.php і заповніть. config.php не викладайте в публічний репозиторій.
return [
    'admin_password'   => '',     // пароль адмінки (admin.html). Порожній = адмінка вимкнена. Мінімум 10 символів.
    'order_prefix'     => 'PL',
    'telegram_token'   => '',     // токен Telegram-бота (BotFather) для сповіщень про замовлення і заявки
    'telegram_chat'    => '',     // ID чату або групи менеджерів
    'notify_email'     => '',     // e-mail, куди дублювати замовлення
    'keycrm_token'     => '',     // API-ключ KeyCRM (Налаштування → API). Порожній = не надсилати в KeyCRM
    'keycrm_source_id' => 0,      // ID джерела «Сайт» у KeyCRM
    'default_opt_discount' => 0,  // знижка %, яку отримує оптовий клієнт після підтвердження, якщо не задано інше
];
