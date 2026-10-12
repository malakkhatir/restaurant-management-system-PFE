<?php
return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'servants' => [
            'driver' => 'session',
            'provider' => 'servants',
        ],
        'livreur' => [
        'driver' => 'sanctum',
        'provider' => 'livreurs',
    ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
        'servants' => [
            'driver' => 'eloquent',
            'model' => App\Models\Servants::class,
        ],
        'livreurs' => [
        'driver' => 'eloquent',
        'model' => App\Models\Livreur::class, // mets ici ton modèle Livreur
    ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];