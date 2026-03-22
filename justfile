build:
    docker compose --parallel=1 build

up:
    docker compose up -d

stop:
    docker compose stop

down:
    docker compose down

logs:
    docker compose logs

ps:
    docker compose ps

[no-exit-message]
cli:
    cd docker && docker compose exec php-cli ash
