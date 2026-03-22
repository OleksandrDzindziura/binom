# Деплой Binom Mebli

## Інфраструктура

- **Сервер**: Hetzner Cloud CX22 (IP: 162.55.48.68)
- **Домен**: binom-mebli.com
- **DNS/CDN/SSL**: Cloudflare (Free plan)
- **Reverse Proxy**: Caddy (в Docker)
- **CI/CD**: GitHub Actions

### Схема роботи

```
git push origin main
       ↓
GitHub Actions (SSH на сервер)
       ↓
git pull → docker build → docker up
       ↓
Користувач → Cloudflare (SSL) → Caddy (:80) → web/api контейнери

binom-mebli.com       → контейнер web (Next.js :3000)
api.binom-mebli.com   → контейнер api (NestJS :3000)
```

---

## 1. Налаштування сервера (з нуля)

### 1.1 Підключитись до сервера

```bash
ssh root@162.55.48.68
```

### 1.2 Встановити Docker та Git

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y git
```

### 1.3 Налаштувати SSH доступ до GitHub

```bash
ssh-keygen -t ed25519 -C "server"
cat ~/.ssh/id_ed25519.pub
```

Скопіювати публічний ключ і додати на GitHub:
**Repository → Settings → Deploy keys → Add deploy key** (увімкнути "Allow write access")

Перевірити:
```bash
ssh -T git@github.com
# Повинно написати: Hi OleksandrDzindziura!
```

### 1.4 Клонувати репозиторій

```bash
git clone git@github.com:OleksandrDzindziura/binom-mebli.git /opt/binom-mebli
cd /opt/binom-mebli
```

### 1.5 Створити .env файл

```bash
nano /opt/binom-mebli/.env
```

Вміст (замінити паролі на свої, **без спецсимволів** `+/=@#` в паролях):

```env
# Database
POSTGRES_USER=binom
POSTGRES_PASSWORD=ТвійСильнийПароль123
POSTGRES_DB=binom

# Redis
REDIS_PASSWORD=ТвійRedisПароль456

# Auth (мінімум 32 символи, однаковий для API і Web)
BETTER_AUTH_SECRET=ТвійСекретМінімум32СимволиТутНаписати

# Cloudflare R2 (файли/зображення)
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=binom
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Опціонально
MAX_FILE_SIZE_MB=50
```

> **Важливо**: Паролі генерувати без спецсимволів, інакше DATABASE_URL зламається.
> Приклад генерації: `openssl rand -hex 20`

### 1.6 Запустити проєкт

```bash
cd /opt/binom-mebli
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 1.7 Перевірити статус

```bash
# Всі контейнери повинні бути Up
docker compose -f docker-compose.prod.yml ps

# Логи
docker compose -f docker-compose.prod.yml logs -f

# Логи окремого сервісу
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs caddy
docker compose -f docker-compose.prod.yml logs postgres
```

---

## 2. Cloudflare DNS

### DNS записи (A-записи, Proxied)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | binom-mebli.com | 162.55.48.68 | Proxied (помаранчева) |
| A | api | 162.55.48.68 | Proxied (помаранчева) |
| CNAME | www | binom-mebli.com | Proxied (помаранчева) |

> **УВАГА**: IP повинен бути саме Hetzner сервера (162.55.48.68), НЕ Namecheap (192.64.119.241).
> Namecheap IP — це їхній redirect сервер, який ламає роботу сайту.

### SSL налаштування

- **SSL/TLS → Overview** → режим **Flexible**
- **SSL/TLS → Edge Certificates** → увімкнути **Always Use HTTPS**

> Flexible = Cloudflare шифрує з'єднання з користувачем (HTTPS), а до сервера ходить по HTTP.

---

## 3. GitHub Actions (CI/CD)

### Як працює

При кожному `git push` в гілку `main` GitHub Actions автоматично:
1. Підключається до сервера по SSH
2. Робить `git pull`
3. Перебудовує Docker контейнери
4. Перезапускає сервіси

### Налаштування секретів

GitHub → **Repository → Settings → Environments → production** → додати секрети:

| Secret | Значення |
|--------|----------|
| `SERVER_HOST` | `162.55.48.68` |
| `SERVER_USER` | `root` |
| `SSH_PRIVATE_KEY` | Приватний SSH ключ (з доступом до сервера) |

> **Важливо**: секрети повинні бути в environment **"production"**, не в "Repository secrets".

### Отримати SSH ключ для GitHub Actions

На **локальному комп'ютері** (який має SSH доступ до сервера):
```bash
cat ~/.ssh/av_salon_rv
# Скопіювати ВСЕ включно з -----BEGIN і -----END
```

---

## 4. Корисні команди на сервері

### Перезапуск

```bash
cd /opt/binom-mebli
docker compose -f docker-compose.prod.yml restart
```

### Повна перебудова

```bash
cd /opt/binom-mebli
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Оновити вручну (без GitHub Actions)

```bash
cd /opt/binom-mebli
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Скинути базу даних (видалити всі дані)

```bash
cd /opt/binom-mebli
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Зайти в контейнер PostgreSQL

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U binom -d binom
```

### Подивитись логи в реальному часі

```bash
docker compose -f docker-compose.prod.yml logs -f --tail 50
```

### Очистити невикористані Docker ресурси

```bash
docker system prune -af
```

---

## 5. Перевірка та засідження бази даних

### Перевірити чи міграції пройшли

Міграції запускаються автоматично при старті API контейнера (через `docker-entrypoint.sh`).
Перевірити в логах:

```bash
docker compose -f docker-compose.prod.yml logs api | grep -i migrat
```

Повинно бути: "Migrations complete."

### Перевірити таблиці в базі

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U binom -d binom -c "\dt"
```

Повинні бути таблиці: `user`, `session`, `account`, `verification`, `car_make`, `car_model`, `car`, `car_image`, `callback_request`, `page`, `news_article`, `delivery_settings`.

### Засідити базу тестовими даними

На сервері:

```bash
# 1. Зайти в API контейнер
docker compose -f docker-compose.prod.yml exec api sh

# 2. Всередині контейнера запустити seed
node dist/src/database/seed.js

# 3. Вийти з контейнера
exit
```

Якщо seed скрипт не скомпільований, можна використати drizzle-kit:

```bash
docker compose -f docker-compose.prod.yml exec api npx drizzle-kit studio
```

### Тестові акаунти (після seed)

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@binom-mebli.com | password123 |
| Manager | manager@binom-mebli.com | password123 |

> **Важливо**: Змініть паролі тестових акаунтів на production!

### Перевірити кількість записів

```bash
# Кількість користувачів
docker compose -f docker-compose.prod.yml exec postgres psql -U binom -d binom -c "SELECT count(*) FROM \"user\";"

# Кількість автомобілів
docker compose -f docker-compose.prod.yml exec postgres psql -U binom -d binom -c "SELECT count(*) FROM car;"

# Кількість марок
docker compose -f docker-compose.prod.yml exec postgres psql -U binom -d binom -c "SELECT count(*) FROM car_make;"
```

---

## 6. Структура Docker контейнерів

| Контейнер | Образ | Порт (внутрішній) | Опис |
|-----------|-------|-------------------|------|
| web | apps/web/Dockerfile | 3000 | Next.js фронтенд |
| api | apps/api/Dockerfile | 3000 | NestJS бекенд |
| postgres | postgres:16 | 5432 | База даних |
| redis | redis:7-alpine | 6379 | Кеш/сесії |
| caddy | caddy:2-alpine | 80 | Reverse proxy |

### Мережа

Всі контейнери в одній Docker мережі `internal`. Зовні доступний тільки порт 80 (Caddy).

```
Інтернет → Cloudflare (443/HTTPS) → Сервер (80/HTTP) → Caddy → web/api
```

---

## 7. Змінні середовища

### API (передаються через docker-compose.prod.yml)

| Змінна | Значення | Опис |
|--------|----------|------|
| DATABASE_URL | postgresql://user:pass@postgres:5432/db | Автоматично з .env |
| BETTER_AUTH_SECRET | з .env | Секрет авторизації |
| BETTER_AUTH_URL | https://api.binom-mebli.com | URL бекенду |
| WEB_URL | https://binom-mebli.com | CORS + trusted origins |
| REDIS_URL | redis://:pass@redis:6379 | Автоматично з .env |
| NODE_ENV | production | Режим |
| R2_* | з .env | Cloudflare R2 для файлів |

### Web (build args + runtime env)

| Змінна | Тип | Значення | Опис |
|--------|-----|----------|------|
| NEXT_PUBLIC_API_URL | build arg | https://api.binom-mebli.com | API URL для браузера |
| NEXT_PUBLIC_R2_PUBLIC_URL | build arg | з .env | Публічний URL R2 |
| API_URL | runtime | http://api:3000 | API URL для SSR (внутрішній) |
| BETTER_AUTH_SECRET | runtime | з .env | Той самий що і в API |
| BETTER_AUTH_URL | runtime | https://binom-mebli.com | URL фронтенду |

---

## 8. Вирішення проблем

### Error 522 (Connection timed out)
Cloudflare не може з'єднатись з сервером.
- Перевірити що Caddy запущений: `docker compose -f docker-compose.prod.yml ps caddy`
- Перевірити що SSL режим **Flexible** в Cloudflare
- Перевірити що IP в DNS — це Hetzner (162.55.48.68), а не Namecheap

### 302 Redirect з "Namecheap URL Forward"
DNS A-записи вказують на IP Namecheap замість Hetzner.
- Змінити IP в Cloudflare DNS на **162.55.48.68**
- Namecheap IP (192.64.119.241) — це їхній redirect сервер

### API контейнер перезапускається (Invalid URL)
Проблема з DATABASE_URL — пароль містить спецсимволи.
- Змінити пароль в `.env` на такий без `+/=@#`
- `docker compose -f docker-compose.prod.yml down -v && docker compose -f docker-compose.prod.yml up -d`

### GitHub Actions: "missing server host"
Секрети не в тому environment.
- Секрети повинні бути в environment **"production"** (Settings → Environments → production)
- Workflow повинен мати `environment: production`

### GitHub Actions: SSH permission denied
- Перевірити що приватний ключ правильний (скопійований повністю)
- Перевірити що відповідний публічний ключ є на сервері в `~/.ssh/authorized_keys`

### Сайт не відкривається (DNS_PROBE_FINISHED_NXDOMAIN)
Кеш DNS на комп'ютері.
- Mac: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`
- Спробувати інкогніто вікно або інший пристрій
- Перевірити що CNAME для www додано в Cloudflare DNS
