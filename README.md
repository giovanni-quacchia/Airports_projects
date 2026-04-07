# Airport Flight Management System

> University project  
> Course: Web Technologies and Databases  
> Academic Year: 2024-2025

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
# Navigate to TAW directory
cd TAW

# Build and start all services (first time)
docker compose up -d --build

# View logs
docker logs -f taw_backend
docker logs -f taw_frontend

# Start/Stop services (subsequent runs)
docker compose start
docker compose stop

# Restart services
docker compose restart

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (database data)
docker compose down -v
```

**Service URLs:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

#### BD Project

```bash
# Navigate to BD directory
cd BD

# Build and start all services
docker compose up -d --build

# View logs
docker logs -f bd_backend
docker logs -f bd_frontend

# Management commands
docker compose start
docker compose stop
docker compose restart
docker compose down

# Remove all data including database
docker compose down -v
```

**Service URLs:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:5001
- PostgreSQL: localhost:5433

---

## 📊 System Features

### User Roles & Permissions

#### 1. **Administrator**
- Create and manage airline accounts (invitation-based registration)
- Delete user accounts
- View system-wide statistics
- Manage all flights, routes, and aircraft
- Access to all administrative endpoints

#### 2. **Airline**
- Create and manage routes
- Create and manage aircraft fleet
- Schedule flights
- Set and update ticket prices (Economy, Business, First Class)
- View airline-specific statistics (passengers, revenue, popular routes)
- Update ticket pricing by class

#### 3. **Customer (Registered User)**
- Search flights by origin and destination (no login required)
- Purchase tickets (login required)
- Select seats
- Add extras (baggage, legroom, etc.)

### Core Functionality

#### Flight Management
- Flight creation with aircraft, route, and schedule assignment
- Real-time seat availability tracking
- Multi-class ticketing (Economy, Business, First Class)
- Dynamic pricing per ticket class

#### Route Management
- Airlines can create routes between airports
- Route assignment to aircraft for specific periods
- Route statistics and analytics

#### Booking System
- Public flight search interface
- Authenticated ticket purchase
- Seat selection mechanism
- Additional services (baggage, premium seating)
- Transaction-safe booking process

#### Statistics & Analytics
- Passenger count per flight
- Revenue tracking by airline
- Most requested routes
- Sortable and filterable data views

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

**Key Design Decisions:**
- Replica set for transaction support
- Foreign key relationships via ObjectId references
- Optional population of referenced documents
- Index optimization for search queries

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

### Authentication Endpoints (TAW)

```
POST   /api/auth/register          # Customer registration
POST   /api/auth/login             # User login
POST   /api/auth/airline/invite    # Admin creates airline (temp password)
POST   /api/auth/change-password   # First-time password change
```

### Flight Search & Booking

```
GET    /api/flights/search?from=XXX&to=YYY    # Public flight search
POST   /api/tickets                           # Purchase ticket (auth)
GET    /api/tickets/:id/seats                 # Available seats
POST   /api/tickets/:id/select-seat           # Seat selection
```

### Admin & Airline Management

```
GET    /api/airlines              # List airlines
POST   /api/airlines              # Create airline (admin)
PUT    /api/airlines/:id          # Update airline
DELETE /api/airlines/:id          # Delete airline (admin)

GET    /api/statistics            # System statistics
GET    /api/statistics/airline/:id # Airline-specific stats
```

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

## 📖 Learning Outcomes

This academic project demonstrates proficiency in:

1. **Full-Stack Development**: End-to-end application development with modern frameworks
2. **Database Design**: Both NoSQL (document-based) and SQL (relational) approaches
3. **Authentication & Authorization**: JWT implementation, role-based access control
4. **Transaction Management**: ACID properties in both MongoDB and PostgreSQL
5. **Containerization**: Docker multi-container orchestration
6. **RESTful API Design**: Proper HTTP methods, status codes, and endpoint structure
7. **Frontend Development**: Angular with reactive programming and routing
8. **Database Optimization**: Indexes, materialized views, query optimization
9. **Data Integrity**: Triggers, constraints, and validation
10. **Software Architecture**: Separation of concerns, service layers, MVC pattern

---

## 📄 License

This project is submitted as academic coursework and is intended for educational purposes only.

---

## 👥 Authors

Giovanni Quacchia - Alessandro Zuccarello 

---

## 📎 References

- Angular Documentation: https://angular.dev
- Express.js Guide: https://expressjs.com
- MongoDB Manual: https://docs.mongodb.com
- PostgreSQL Documentation: https://www.postgresql.org/docs/
