# Airport Flight Management System

> University project  
> Course: Web Technologies and Databases  
> Academic Year: 2024-2025

https://github.com/user-attachments/assets/33111da5-4f16-445d-8984-34bd88871249


## 📋 Project Overview

This repository contains two complementary academic projects developed as part of the Web Technologies and Databases curriculum. The system implements a comprehensive airline flight management platform with two different architectural approaches, demonstrating proficiency in both NoSQL (MongoDB) and SQL (PostgreSQL) database paradigms.

### Project Components

1. **TAW (Web Technologies Project)**: A full-stack application using the MEAN stack (MongoDB, Express.js, Angular, Node.js)
2. **BD (Database Project)**: A database-focused implementation using PostgreSQL with a Flask backend and Angular frontend

Both projects provide a complete flight booking and management system with role-based access control, transaction handling, and real-time availability tracking.

---

## 🏗️ Architecture

### TAW Project (NoSQL Implementation)

**Technology Stack:**
- **Frontend**: Angular 20.x with TypeScript
- **Backend**: Node.js with Express 5.x and TypeScript
- **Database**: MongoDB 6.x with Replica Set
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker with Docker Compose

**Key Features:**
- RESTful API architecture
- MongoDB transactions using replica sets
- Real-time seat availability
- Role-based access control (Admin, Airline, Customer)
- Reactive forms and routing

### BD Project (SQL Implementation)

**Technology Stack:**
- **Frontend**: Angular with TypeScript
- **Backend**: Python Flask
- **Database**: PostgreSQL 16
- **Containerization**: Docker with Docker Compose

**Key Features:**
- Relational database design with triggers and constraints
- Materialized views for statistics
- Database-level access control with user roles
- Complex SQL queries and aggregations
- Transactional integrity with ACID properties

---

## 🚀 Getting Started

### Prerequisites

- Docker
- Docker compose

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
```

### Installation & Deployment

#### TAW Project

```bash
cd TAW
docker compose up -d --build
```

**Service URLs:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

#### BD Project

```bash
cd BD
docker compose up -d --build
```

**Service URLs:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:5001
- PostgreSQL: localhost:5433

---

## 📊 System Features


#### 1. **Admin**
- Create new airlines
- Delete user accounts
- Access to all administrative endpoints

#### 2. **Airlines**
- Create and manage routes
- Create and manage airplanes
- Create and manage flights
- Set and update ticket prices (Economy, Business, First Class)
- View airline-specific statistics (passengers, revenue, popular routes)

#### 3. **Customer (Registered User)**
- Search flights by origin and destination (no login required)
- Purchase tickets (login required)
- Select seats
- Add extras (baggage, legroom, etc.)

---

## 🗄️ Database Design

### TAW (MongoDB Schema)

**Collections:**
- `users`: Authentication and role management
- `airlines`: Airline company information
- `airports`: Airport details
- `routes`: Flight routes (origin → destination)
- `airplanes`: Aircraft fleet
- `flights`: Scheduled flights
- `tickets`: Booking records
- `passengers`: Passenger information linked to tickets

### BD (PostgreSQL Schema)

**Key Tables:**
- `airlines`: Airline companies with authentication
- `users`: Customer accounts
- `airports`: Airport information
- `routes`: Flight routes
- `airplanes`: Aircraft fleet
- `flights`: Scheduled flights
- `tickets`: Booking records with ENUM types (ECONOMY, BUSINESS, FIRST_CLASS)

**Database Features:**
- **Triggers**: 
  - Validate airline consistency (flight.airline = airplane.airline)
  - Auto-generate flight codes (airline_code + number)
  - Maintain flight code consistency per route
- **Views**: Role-based data access for non-admin users
- **Materialized Views**: Pre-calculated statistics for performance
- **Constraints**: Deferrable constraints for complex transactions
- **Indexes**: Optimized query performance
- **Row-Level Security**: Fine-grained access control

---

## 📚 API Documentation

See [TAW API Documentation](./TAW/giovanni_quacchia_900676.pdf) (in italian)

See [BD Documentation](./BD/Documentazione%20BD.pdf) (in italian)

---

## 🧪 Testing

The system includes pre-loaded test data:

**Admin user**: `admin@gmail.com:admin`

**Test customer accounts**:
- `user@gmail.com:user`
- `user@gmail.com:user2`

**Airlines**: 

TAW:
- Ryanair (FR): contact@ryanair.com / password
- British Airways (BA): contact@ba.com / password
- Air France (AF): contact@airfrance.com / password
- Lufthansa (LH): contact@lufthansa.com / password
- ITA Airways (AZ): contact@itaairways.com / password
- Emirates (EK): contact@emirates.com / password

BD:
- American Airlines (AA): american@contact.com / password
- British Airways (BA): british@contact.com / password
- Air France (AF): airfrance@contact.com / password
- Emirates (EK): emirates@contact.com / password
- Alitalia (AZ): alitalia@contact.com / password
- Ryanair (FR): ryanair@contact.com / password

---

## 📄 License

This project is submitted as academic coursework and is intended for educational purposes only.

---

## 👥 Authors

Giovanni Quacchia - Alessandro Zuccarello 

---

**Note**: The included .env files are provided for demonstration purposes only to ensure the project runs out of the box. For any production deployment, these files should be excluded from version control and populated with unique, newly generated security keys and credentials.