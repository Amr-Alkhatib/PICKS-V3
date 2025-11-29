<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sanctum Settings
    |--------------------------------------------------------------------------
    */
    // Domains that should receive stateful (cookie) authentication. Configure this
    // on the server with `SANCTUM_STATEFUL_DOMAINS` (comma-separated). By default
    // this falls back to the FRONTEND_URL (protocol stripped) so deployments on
    // Vercel or other hosts can be whitelisted.
    'stateful' => explode(',', env(
        'SANCTUM_STATEFUL_DOMAINS',
        // strip protocol from FRONTEND_URL if present
        str_replace(['http://', 'https://'], '', env('FRONTEND_URL', 'localhost'))
    )),

    'guard' => ['web'],

    'expiration' => 525600,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
