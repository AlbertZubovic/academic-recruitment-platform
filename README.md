# TEACH TEAM UNIVERSITY JOB APPLICATION SYSTEM

The github for this project can be found here: https://github.com/rmit-fsd-2025-s1/s4007755-s3832786-a2

This is teach team, a solution allowing lecturers to find candidates for roles for their courses.
Candidates can apply for roles, update their skill set and information and withdraw applications if needed.

Lecturers can find candidates that have applied, rank them, add notes and accept or reject applications.

Additionally an Admin Site has been created to allow for administration of candidates, lecturers and courses.

If a candidate is blocked, lecturers will be notified in real time and the application will be retracted.

---

## ER Diagram

The ER Diagram can be found in ~\backend\docs

## Tech Stack

The project is built with a modern, modular architecture. Here is the technology breakdown for each service:

### Main Application (Student & Lecturer Facing)

-   **`frontend` (Port 3000):**
    -   **Framework**: Next.js, React
    -   **Language**: TypeScript
    -   **Styling**: Chakra UI & Tailwind CSS
    -   **API Communication**: Apollo Client for GraphQL

-   **`backend` (Port 5000):**
    -   **Framework**: Node.js, Express
    -   **Language**: TypeScript
    -   **API**: GraphQL with Apollo Server
    -   **Database**: TypeORM with a MySQL database
    -   **Authentication**: JSON Web Tokens (JWT) and bcrypt for password hashing

### Admin Site

-   **`admin-site/admin-frontend` (Port 3001):**
    -   **Framework**: Next.js, React
    -   **Language**: TypeScript
    -   **Styling**: Tailwind CSS
    -   **API Communication**: Apollo Client for GraphQL

-   **`admin-site/admin-backend` (Port 4000):**
    -   **Framework**: Node.js, Express
    -   **Language**: TypeScript
    -   **API**: GraphQL with Apollo Server
    -   **Real-time Communication**: WebSocket subscriptions with `graphql-ws`
    -   **Database**: TypeORM with a MySQL database
    -   **Authentication**: JSON Web Tokens (JWT)

---

## Project Structure

The project is a monorepo containing the four separate services:

-   `frontend/`: The main website for students to browse courses and apply. (Port 3000)
-   `backend/`: The main backend that serves the student frontend, handling applications, user data, etc. (Port 5000)
-   `admin-site/admin-frontend/`: The admin dashboard for managing users, courses, and viewing applications. (Port 3001)
-   `admin-site/admin-backend/`: The backend for the admin site, providing administrative GraphQL operations. (Port 4000)

---

## Getting Started (Docker - Recommended)

Using Docker is the recommended way to run this project, as it handles all dependencies and services automatically.

### 1. Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.



### 2. Build and Run the Containers

Open a terminal in the project root directory and run the following command. This will build the images for all four services and start them.

```bash
docker-compose up --build
```
### 3. Accessing the Services

Once the containers are running, you can access the services at the following URLs:

-   **Main Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Admin Frontend**: [http://localhost:3001](http://localhost:3001)
-   **Main Backend (GraphQL)**: [http://localhost:5000/graphql](http://localhost:5000/graphql)
-   **Admin Backend (GraphQL)**: [http://localhost:4000/graphql](http://localhost:4000/graphql)

### 4. Test User Accounts

The database is seeded with test accounts. The password for all lecturers and candidates is `Password123!`.

**Lecturer Logins:**
| Email                         | Password       |
| ----------------------------- | -------------- |
| `alice.lecturer@example.com`  | `Password123!` |
| `bob.lecturer@example.com`    | `Password123!` |
| `fiona.lecturer@example.com`  | `Password123!` |

**Candidate Logins:**
| Email                           | Password       |
| ------------------------------- | -------------- |
| `charlie.candidate@example.com` | `Password123!` |
| `diana.candidate@example.com`   | `Password123!` |
| `edward.candidate@example.com`  | `Password123!` |
| `grace.candidate@example.com`   | `Password123!` |
| `henry.candidate@example.com`   | `Password123!` |

**Admin Login (for Admin Site):**
| Username | Password |
| -------- | -------- |
| `admin`  | `admin`  |

### 5. Stopping the Services

To stop all running containers, press `Ctrl + C` in the terminal and then run:

```bash
docker-compose down
```
To also remove the volumes (useful for a clean restart), run:
```bash
docker-compose down -v
```
---

## Local Development (Alternative)

If you prefer not to use Docker, you can run each service manually. You will need Node.js (v18 or later) installed.

For each service (`frontend`, `backend`, `admin-site/admin-frontend`, `admin-site/admin-backend`):

1.  Navigate to the service directory: `cd path/to/service`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`