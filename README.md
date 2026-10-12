<h1 align="center">🍽️ Restaurant Management System</h1>

<p align="center">
  Application web <b>full-stack</b> de gestion de restaurant — Projet de Fin d'Études (PFE)<br>
  <b>Laravel 10 · React 19 · MySQL 8 · Docker · phpMyAdmin</b>
</p>

---

## 📌 Présentation

**RMS** est une plateforme qui digitalise l'ensemble des opérations d'un restaurant : gestion des utilisateurs, du menu, des tables, des réservations, des commandes, des livraisons, des stocks et des rapports.

---

## 🎯 Objectifs

- Gérer les utilisateurs (admin, client, servant, livreur)
- Gérer le menu et les catégories
- Gérer les tables et les réservations
- Gérer les commandes et les livraisons
- Gérer les ventes, stocks et fournisseurs
- Gérer les feedbacks, réclamations et rapports

---

## 🧰 Stack technique

### Backend
- Laravel 10.x
- PHP 8.2
- Sanctum
- Maatwebsite Excel (export des ventes)
- MySQL 8

### Frontend
- React 19
- React Router
- Axios
- TailwindCSS + Bootstrap

### Infrastructure
- Docker / Docker Compose
- MySQL
- phpMyAdmin

---

## 🏗️ Architecture

```text
[Navigateur]
     │
     ▼
[Frontend React :3000]
     │  HTTP / JSON
     ▼
[Backend Laravel API :8000]
     │
     ▼
[MySQL :3306]
     │
     ▼
[phpMyAdmin :8081]
```

---

## 👤 Rôles & Permissions

| Rôle | Espace | Capacités principales |
|------|--------|-----------------------|
| **Admin** | `/user/admin/...` | Gestion complète (menu, tables, servants, livreurs, stocks, fournisseurs, commandes, livraisons, réservations, feedbacks, réclamations, rapports) |
| **Client** | `/user/client/...` | Inscription, menu, commandes, réservations, avis, réclamations |
| **Servant** | `/user/servant/...` | Tables, commandes locales/en ligne, livraisons, réservations |
| **Livreur** | `/user/livreur/...` | Profil, statut, livraisons assignées, historique |

> ⚠️ Les permissions sont gérées principalement côté **Frontend** (AuthGuard / RoleGuard). L'API n'applique pas encore de RBAC strict.

---

## 🚀 Installation & Lancement

### ✅ Méthode recommandée (Docker)

```bash
docker compose up -d --build
docker compose exec backend php artisan migrate --force
```

### 🌐 Accès aux services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| phpMyAdmin | http://localhost:8081 |
| MySQL | localhost:3306 |

### 🔑 Paramètres MySQL

| Paramètre | Valeur |
|-----------|--------|
| Host interne | `mysql` |
| Base | `restaurant_db` |
| User | `restaurant_user` |
| Password | `restaurant_pass` |
| Root | `root` |

### 🛠️ Méthode manuelle

**Backend**

```bash
cd Back-end
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

**Frontend**

```bash
cd front-end
npm install
npm start
```

---

## 🔌 API — Endpoints principaux

**Base URL :** `http://localhost:8000/api`

### Auth
- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /user` *(auth:sanctum)*

### Ressources (CRUD complet)
`categories` · `menus` · `sales` · `servants` · `tables` · `payments` · `orders` · `livreurs` · `livrisons`

### Routes spécifiques

- **Menus :** `GET /menu`, `GET /menu/category`
- **Tables :** `PUT /tables/{id}/status`
- **Rapports :** `POST /report`, `POST /export-sales`
- **Feedbacks :** `GET /feedback`, `POST /feedback`
- **Réclamations :** `GET /reclamations`, `POST /reclamations`
- **Réservations :** `GET/POST/PUT/DELETE /reservations`
- **Commandes / Livraisons :** `GET /orders/user/{id}`, `PUT /orderstatus/{id}`, `PUT /updateStatuslivrison/{id}`

---

## 🗄️ Base de données

### Tables principales

`users` · `servants` · `livreurs` · `categories` · `menus` · `tables` · `sales` · `menu_sales` · `orders` · `livrisons` · `reservations` · `feedbacks` · `reclamations` · `fournisseurs` · `stocks`

### Relations clés

- `users 1..* orders`
- `users 1..* reservations`
- `orders 1..* livrisons`
- `livreurs 1..* livrisons`
- `categories 1..* menus`
- `sales .. menus` via `menu_sales`
- `fournisseurs 1..* stocks`

---

## ✅ Vérifications rapides

```bash
docker compose ps
docker compose exec backend php artisan route:list --path=api
curl http://localhost:8000/api/menu
```

---

## ⚠️ Points techniques

- La majorité des routes API utilisent uniquement le middleware `api` (pas de RBAC strict).
- Route `POST /api/send-reclamation-response` déclarée mais méthode non implémentée.
- Authentification mixte : session/CSRF pour `users`, token Sanctum pour `servants` et `livreurs`.

---

## 🛣️ Roadmap

- [ ] Middleware RBAC backend (admin, client, servant, livreur)
- [ ] Uniformiser l'authentification via Sanctum
- [ ] Corriger les routes sans implémentation
- [ ] Publier une collection Postman officielle
- [ ] Ajouter des tests Feature Laravel

---

## 👩‍💻 Auteure

**Malak Khatir** — Projet de Fin d'Études (PFE)
