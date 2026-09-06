# 🛡️ AegisID

> **Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management**

AegisID is a secure identity and digital asset management platform designed around **decentralized identity, verifiable credentials, role-based access control, and blockchain-backed integrity verification**.

The project is built as a prototype for **Smart India Hackathon (SIH) 2026 – Problem Statement SIH26125**.

---


## 🚀 Key Features

### 🔐 Authentication & Access Control
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Fine-grained permission-based API authorization
- User account status enforcement
- Protected backend APIs
- WebAuthn support in the backend

### 🆔 Digital Identity
- Identity management
- Decentralized Identifier (DID) support
- Identity verification status
- Identity lifecycle status
- SHA-256 identity hashing
- Blockchain anchoring of identity proofs

### 📜 Verifiable Credentials
- Create and manage verifiable credentials
- Credential hashing
- Credential verification
- Credential validation
- Credential lifecycle management
- Revoke / reactivate / expire credentials
- Blockchain anchoring

### 💼 Digital Asset Management
- Create digital assets
- Update asset information
- Assign assets
- Transfer ownership
- Revoke and restore assets
- Asset integrity verification
- Blockchain-backed asset records

### ⛓️ Blockchain Integration
- Solidity smart contract
- Local EVM blockchain using Hardhat
- Spring Boot ↔ blockchain integration using Web3j
- Identity, credential and asset anchoring
- On-chain status and ownership updates
- Blockchain transaction tracking
- Transaction hash, block number and gas usage records

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │   React / Vite UI   │
                         └──────────┬──────────┘
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │   Spring Boot API   │
                         │       Java 17       │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
        │    MySQL     │    │ JWT / RBAC   │   │    Web3j     │
        │ Persistent DB│    │  Security    │   │ Blockchain   │
        └──────────────┘    └──────────────┘   └──────┬───────┘
                                                       │
                                                       ▼
                                             ┌──────────────────┐
                                             │ Solidity Registry│
                                             │   EVM / Hardhat  │
                                             └──────────────────┘
```

### Data principle

Sensitive information is intended to remain **off-chain**.

```text
MySQL
  └── Identity metadata
  └── Credential data
  └── User / role / permission data
  └── Digital asset metadata
  └── Blockchain transaction records

Blockchain
  └── Cryptographic proofs / hashes
  └── Wallet addresses
  └── Integrity/status records
  └── Transaction history
```

Passwords, private keys, and sensitive personal documents should **never be stored on-chain**.

---

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Java 17 + Spring Boot |
| Database | MySQL |
| Authentication | Spring Security + JWT |
| Access Control | RBAC + Permissions |
| Web3 Integration | Web3j |
| Smart Contract | Solidity |
| Blockchain | EVM / Hardhat |
| Build Tool | Maven |
| Frontend Package Manager | npm |

---

## 📁 Project Structure

```text
AegisID/
│
├── blockchain/
│   ├── contracts/
│   │   └── AegisIDRegistry.sol
│   ├── ignition/
│   │   └── modules/
│   │       └── AegisIDRegistry.ts
│   ├── hardhat.config.ts
│   └── package.json
│
├── backend/
│   └── backend/
│       ├── pom.xml
│       ├── mvnw
│       ├── mvnw.cmd
│       └── src/
│           └── main/
│               ├── java/
│               │   └── com/AegisID/backend/
│               └── resources/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── package.json
└── README.md
```

---

# ▶️ Local Setup

## Prerequisites

Install:

- Node.js
- npm
- Java 17+
- Maven (optional because Maven Wrapper is included)
- MySQL
- Git

---

## 1. Start MySQL

Make sure your MySQL server is running and the AegisID database is available.

Example:

```sql
CREATE DATABASE aegisid;
```

Configure the database credentials using environment variables rather than committing passwords.

---

## 2. Start the Blockchain

Open **Terminal 1**:

```powershell
cd D:\projects\AegisID\blockchain
npm install
npx hardhat node
```

The local blockchain runs at:

```text
http://127.0.0.1:8545
```

Default Hardhat chain ID:

```text
31337
```

Keep this terminal running.

### Existing local contract

The development deployment used by the project is:

```text
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

If the Hardhat network is reset and the contract is redeployed, update the backend contract address accordingly.

---

## 3. Start the Spring Boot Backend

Open **Terminal 2**:

```powershell
cd D:\projects\AegisID\backend\backend
.\mvnw.cmd spring-boot:run
```

Or, if Maven is installed globally:

```powershell
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

Health endpoint:

```text
http://localhost:8080/api/health
```

---

## 4. Start the Frontend

Open **Terminal 3**:

```powershell
cd D:\projects\AegisID
npm install
npm run dev
```

Vite normally starts the frontend at:

```text
http://localhost:5173
```

---

# 🔑 Authentication

Protected endpoints require a JWT.

Login first through the authentication API and use the returned token in:

```http
Authorization: Bearer <JWT>
```

Example:

```http
GET /api/users
Authorization: Bearer eyJ...
```

Authorization is controlled through permissions such as:

```text
USER_READ
IDENTITY_READ
IDENTITY_CREATE
CREDENTIAL_READ
CREDENTIAL_CREATE
CREDENTIAL_VERIFY
ASSET_READ
ASSET_MINT
ASSET_TRANSFER
ASSET_REVOKE
```

The exact permission required depends on the endpoint.

---

# 🌐 Main API Groups

The backend exposes REST APIs for:

```text
/api/auth/*
/api/users/*
/api/identities/*
/api/credentials/*
/api/assets/*
/api/blockchain/*
/api/health
```

Major blockchain operations include:

```text
GET  /api/blockchain/status
GET  /api/blockchain/contract

GET  /api/blockchain/identity/{identityHash}
POST /api/blockchain/identity/anchor

GET  /api/blockchain/credential/{credentialHash}
POST /api/blockchain/credential/anchor
GET  /api/blockchain/credential/{credentialId}/verify

GET  /api/blockchain/asset/{assetHash}
POST /api/blockchain/asset/anchor
PUT  /api/blockchain/asset/{assetHash}/status
PUT  /api/blockchain/asset/{assetHash}/owner
```

> For frontend integration, treat the backend implementation and API responses as the source of truth.

---

# ⛓️ Smart Contract

The main Solidity contract is:

```text
AegisIDRegistry
```

It maintains blockchain records for:

- Identity
- Verifiable Credential
- Digital Asset

Conceptually:

```text
Identity Hash ───────► Identity Record
Credential Hash ─────► Credential Record
Asset Hash ──────────► Asset Record
```

Each record contains blockchain-level information such as:

- hash
- wallet/owner address
- timestamp
- active status

---

# 🔄 Core AegisID Flow

```text
User
 │
 ▼
Authentication
 │
 ▼
Role + Permission Check
 │
 ▼
Digital Identity / DID
 │
 ▼
Verifiable Credential
 │
 ▼
SHA-256 Hash
 │
 ▼
Blockchain Anchor
 │
 ▼
Blockchain Transaction
 │
 ▼
Integrity Verification
 │
 ▼
Digital Asset Management
```

---

# 🧪 Backend Verification

Before a demo, verify the three services are running:

### Blockchain

```text
127.0.0.1:8545
```

### Backend

```text
localhost:8080
```

### Frontend

```text
localhost:5173
```

Recommended smoke-test sequence:

```text
1. MySQL running
2. Hardhat node running
3. Spring Boot starts successfully
4. /api/health returns 200
5. Login returns JWT
6. Protected API works with JWT
7. Blockchain status works with JWT
8. Blockchain read works
9. Blockchain write creates a confirmed transaction
10. Frontend can consume the API
```

---

# 🔒 Security Notes

For development and hackathon deployment:

- Keep JWT secrets outside source control.
- Keep database passwords outside source control.
- Keep blockchain private keys outside source control.
- Use environment variables for secrets.
- Never commit production credentials.
- Never store passwords or private keys on the blockchain.
- Remove debug logging before final deployment.
- Return DTOs instead of exposing internal entities containing sensitive fields.

Example environment variables:

```text
JWT_SECRET
DB_USERNAME
DB_PASSWORD
BLOCKCHAIN_RPC_URL
BLOCKCHAIN_CONTRACT_ADDRESS
BLOCKCHAIN_PRIVATE_KEY
```

Create your own local `.env` / IDE environment configuration as appropriate. Do **not** commit secret values.

---

# 🎯 Hackathon Demo

AegisID demonstrates the following end-to-end concept:

```text
Login
  ↓
Authenticated User
  ↓
Identity / DID
  ↓
Credential Creation
  ↓
Credential Hash
  ↓
Blockchain Anchoring
  ↓
Credential Verification
  ↓
Digital Asset Creation
  ↓
Blockchain Asset Anchor
  ↓
Ownership Transfer
  ↓
Asset Status Management
  ↓
Blockchain Verification
```

The goal is to demonstrate how **identity, access control, verifiable credentials, and digital asset integrity** can work together using blockchain technology.

---

## 📌 Project Status

**Hackathon MVP: Ready for integration and demonstration 🚀**

Current focus:

- Frontend ↔ Backend integration
- End-to-end testing
- Deployment
- Demo preparation
- Presentation / PPT

The backend is considered **feature-frozen for the hackathon**. New features should only be added if they are required to fix an integration or demonstration blocker.

---

## 👨‍💻 Project

**AegisID — SIH26125**

Blockchain-based secure platform for:

> **Identity • Access Control • Verifiable Credentials • Digital Asset Management**

Built for **Smart India Hackathon 2026**.

---

## 📄 License

AegisID is licensed under the **MIT License**.

Copyright (c) 2026 Soumyajit Saha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
