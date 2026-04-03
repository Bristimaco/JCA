#!/usr/bin/env bash
set -e

# Start the scheduler loop in the background
(while true; do php artisan schedule:run --verbose --no-interaction >> /dev/null 2>&1; sleep 60; done) &

# Start the queue worker in the background
php artisan queue:work --tries=3 --timeout=120 --sleep=3 &

# Wait for either process to exit — if one dies, exit so DO restarts the worker
wait -n
exit 1
