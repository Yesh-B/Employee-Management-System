# Employee Management System

A full-stack Employee Management System with a **frontend served by Nginx** and a **backend REST API built with Flask**, fully containerized using **Docker Compose**.

---

## Tech Stack

* **Frontend:** Static frontend served via Nginx
* **Backend:** Python Flask (REST API)
* **Containerization:** Docker & Docker Compose
* **Platform:** Windows (Docker Desktop + WSL2), macOS, Linux

---

## Prerequisites

Before running the project, make sure you have:

* **Docker Desktop**

  * On Windows: Docker Desktop must be running and using **Linux containers**
* **Docker Compose** (included with Docker Desktop)

---

## Setup & Run (Local Development)

### 1️. Start Docker Desktop

 **Important for Windows users:**
Docker Desktop **must be running** before executing Docker commands.

Wait until it shows **“Docker Desktop is running”**.

---

### 2️. Clone the repository

```bash
git clone <[your-repo-url](https://github.com/Yesh-B/Employee-Management-System/)>
cd Employee Management System
```

---

### 3️. Build and start the application

```bash
docker-compose up --build
```

This command will:

* Build frontend and backend Docker images
* Create a Docker network
* Start all required containers

---

## Access the Application

### Frontend (User Interface)

Open your browser and navigate to:

```
http://localhost:3000
```

---

### Backend (API)

The backend Flask API is available at:

```
http://localhost:5000
```

> Note: Accessing `/` on the backend will return `404` unless explicitly defined. This is expected behavior.

---

## Application Architecture

```
Browser
  ↓ http://localhost:3000
Frontend (Nginx container)
  ↓ http://employee-backend:5000
Backend (Flask API container)
```

* The frontend communicates with the backend using the Docker service name `employee-backend`
* Inside Docker containers, **do not use `localhost`** to reach the backend

---

## Stopping the Application

To stop the running containers:

```
CTRL + C
```

Then clean up:

```bash
docker-compose down
```

---

## Useful Docker Commands

Check running containers:

```bash
docker ps
```

View logs:

```bash
docker-compose logs
```

Rebuild and restart everything:

```bash
docker-compose down
docker-compose up --build
```

---

## Common Issues

### Docker error: `dockerDesktopLinuxEngine`

**Cause:** Docker Desktop is not running

**Solution:** Start Docker Desktop and retry the command
