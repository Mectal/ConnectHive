# ConnectHive Backend

This directory contains the backend code for the ConnectHive project.

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (Version 12 or higher recommended)
- [MySQL](https://www.mysql.com/) server

### Environment Variables

Create a `.env` file in the `backend` directory to store your database configuration and JWT secret. This file should not be committed to version control for security reasons.

Here’s an example `.env` file:

```plaintext
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=connecthive
JWT_SECRET=your_jwt_secret
