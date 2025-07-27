# building-work-orders

A Node.js application to monitor the NSW Building Work Orders register and send email notifications for new Stop Work Orders.

## Project Setup

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone Repository

```sh
git clone <your-repository-url>
cd building-work-orders
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Start Database Container

Start a SQL Server instance using Docker. Replace yourStrong(!)Password123 with a secure password.

```sh
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=yourStrong(!)Password123" -p 1433:1433 --name sqlserver -d [mcr.microsoft.com/mssql/server:2019-latest](https://mcr.microsoft.com/mssql/server:2019-latest)
```

### 4. Initialize Database Schema

Connect to the database (server: localhost, user: sa) and run the following script:

```sql
CREATE DATABASE WorkOrdersMonitor;
GO
USE WorkOrdersMonitor;
GO
CREATE TABLE BuildingWorkOrders (
    id INT PRIMARY KEY IDENTITY(1,1),
    company_name NVARCHAR(255) NOT NULL,
    company_number NVARCHAR(50) NULL,
    company_address NVARCHAR(255) NULL,
    order_type NVARCHAR(100) NOT NULL,
    date_added DATE NOT NULL,
    scraped_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_Order UNIQUE (company_name, date_added, company_address)
);
GO
```

### 5. Configure Environment Variables

Create a .env file in the project root. For testing, generate free email credentials at Ethereal.email.

```ini
# Database Credentials
DB_USER=sa
DB_PASSWORD=yourStrong(!)Password123
DB_SERVER=localhost
DB_DATABASE=WorkOrdersMonitor

# Email Credentials (from Ethereal.email)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_username
EMAIL_PASS=your_ethereal_password
```

## Running the Monitor

```sh
node src/index.js
```

The application will run once immediately and then on a schedule (default: every hour at 30 minutes past the hour). New "Stop Work Orders" will trigger an email notification.

## Production

ConsiderationsContainerize: Package the application into a Docker image using a Dockerfile.
Managed Services: Use a cloud database (Azure SQL, AWS RDS) instead of a local container.
Secret Management: Store credentials in a secure vault (Azure Key Vault, AWS Secrets Manager).
Deployment: Deploy the container to a serverless platform (Azure Container Apps, AWS Fargate) with a CI/CD pipeline.
