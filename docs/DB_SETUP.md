# Database Setup & Configuration Guide (docs/DB_SETUP.md)

UncoverCeylon supports a production-grade **MySQL 8** database engine with full UTF-8 Unicode support (`utf8mb4_unicode_ci`) for Sinhala and multilingual text. It also features a zero-configuration **SQLite** fallback for local testing.

---

## 1. Local Development Setup Options

### Option A: Docker (Fastest - Recommended)
If you have Docker installed, launch a ready-to-use MySQL 8 container in one line:
```bash
docker run --name uncoverceylon-mysql \
  -e MYSQL_ROOT_PASSWORD=rootsecret \
  -e MYSQL_DATABASE=uncoverceylon \
  -e MYSQL_USER=uncoverceylon \
  -e MYSQL_PASSWORD=ceylonpassword \
  -p 3306:3306 \
  -d mysql:8 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

### Option B: Local Windows / macOS Installation
1. **Windows**: Download the official [MySQL Community Server Installer](https://dev.mysql.com/downloads/installer/). Select Developer Default or Server Only. Set root password and create user `uncoverceylon`.
2. **macOS**: Install via Homebrew:
   ```bash
   brew install mysql
   brew services start mysql
   mysql -u root -e "CREATE DATABASE uncoverceylon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

### Option C: Zero-Config SQLite Fallback
If MySQL is not installed locally on your development machine, the system will automatically fall back to SQLite using `data/uncoverceylon.db`. All builds and typechecks will continue to pass without errors.

---

## 2. Production VPS Setup (Ubuntu 22.04 / 24.04 LTS)

On your Ubuntu VPS, run the following commands to install and configure MySQL 8 with least-privilege security:

```bash
# 1. Install MySQL Server
sudo apt update
sudo apt install -y mysql-server

# 2. Ensure MySQL binds strictly to localhost (127.0.0.1) for maximum security
sudo sed -i 's/^bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql

# 3. Create dedicated Database and Least-Privilege User
sudo mysql << "EOF"
CREATE DATABASE IF NOT EXISTS uncoverceylon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'uncoverceylon'@'127.0.0.1' IDENTIFIED BY 'STRONG_SECRET_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON uncoverceylon.* TO 'uncoverceylon'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF
```

---

## 3. Environment Variables (`.env`)

Create a `.env` file in the project root with the following configuration:

```env
# Database Engine (mysql or sqlite)
DB_TYPE=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=uncoverceylon
MYSQL_PASSWORD=STRONG_SECRET_PASSWORD_HERE
MYSQL_DATABASE=uncoverceylon

# Authentication & Admin Seed
OWNER_EMAIL=owner@uncoverceylon.com
OWNER_INITIAL_PASSWORD=CeylonOwner2026!
SESSION_SECRET=generate_a_random_32_byte_hex_string_here
```

---

## 4. Running Migrations & Seeding

Once MySQL is connected, run:
```bash
# 1. Execute SQL Migrations (creates all tables and indexes)
npm run db:migrate

# 2. Seed Initial Admin Account, Categories, and Site Nodes
npm run db:seed

# 3. Migrate Existing SQLite Destinations into MySQL
node scripts/migrate-sqlite-to-mysql.js
```

---

## 5. Automated Daily Backups

To create an automatic daily backup of the MySQL database:
```bash
# Add cron job for daily 02:00 AM backup retaining last 14 days
crontab -e
# Paste:
0 2 * * * mysqldump -u uncoverceylon -p'STRONG_SECRET_PASSWORD_HERE' uncoverceylon | gzip > /var/backups/uncoverceylon_$(date +\%F).sql.gz && find /var/backups/ -name "uncoverceylon_*.sql.gz" -mtime +14 -exec rm {} \;
```
Backups can also be initiated or downloaded directly by the Site Owner inside the Admin Panel.
