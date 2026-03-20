<?php

namespace App\Enums;

enum BeltRank: string
{
    case White = 'white';
    case Yellow = 'yellow';
    case Orange = 'orange';
    case Green = 'green';
    case Blue = 'blue';
    case Brown = 'brown';
    case Black1Dan = 'black_1dan';
    case Black2Dan = 'black_2dan';
    case Black3Dan = 'black_3dan';
    case Black4Dan = 'black_4dan';
    case Black5Dan = 'black_5dan';
    case Black6Dan = 'black_6dan';
    case Black7Dan = 'black_7dan';
    case Black8Dan = 'black_8dan';
    case Black9Dan = 'black_9dan';
    case Black10Dan = 'black_10dan';

    public function label(): string
    {
        return match ($this) {
            self::White => 'Wit',
            self::Yellow => 'Geel',
            self::Orange => 'Oranje',
            self::Green => 'Groen',
            self::Blue => 'Blauw',
            self::Brown => 'Bruin',
            self::Black1Dan => 'Zwart 1e Dan',
            self::Black2Dan => 'Zwart 2e Dan',
            self::Black3Dan => 'Zwart 3e Dan',
            self::Black4Dan => 'Zwart 4e Dan',
            self::Black5Dan => 'Zwart 5e Dan',
            self::Black6Dan => 'Zwart 6e Dan',
            self::Black7Dan => 'Zwart 7e Dan',
            self::Black8Dan => 'Zwart 8e Dan',
            self::Black9Dan => 'Zwart 9e Dan',
            self::Black10Dan => 'Zwart 10e Dan',
        };
    }

    public function sortOrder(): int
    {
        return match ($this) {
            self::White => 0,
            self::Yellow => 1,
            self::Orange => 2,
            self::Green => 3,
            self::Blue => 4,
            self::Brown => 5,
            self::Black1Dan => 6,
            self::Black2Dan => 7,
            self::Black3Dan => 8,
            self::Black4Dan => 9,
            self::Black5Dan => 10,
            self::Black6Dan => 11,
            self::Black7Dan => 12,
            self::Black8Dan => 13,
            self::Black9Dan => 14,
            self::Black10Dan => 15,
        };
    }
}
