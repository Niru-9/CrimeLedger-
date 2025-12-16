# CrimeLedger: Complete Code Explanation Guide

**Last Updated**: December 15, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

## Table of Contents

1. [Frontend JavaScript Code](#frontend-javascript-code)
2. [Frontend CSS Styling](#frontend-css-styling)
3. [Backend JavaScript Code](#backend-javascript-code)
4. [Smart Contracts (Solidity)](#smart-contracts-solidity)
5. [Data Flow Architecture](#data-flow-architecture)

---

## FRONTEND JAVASCRIPT CODE

### 1. Application Entry Point: `src/main.jsx`

**Purpose**: Initializes the entire React application and sets up necessary services.

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import CrimeLeaderApp from './CrimeLeader';
import { initializeServices } from './services/initialize';
import { WalletProvider } from './contexts/WalletProvider';
import './styles/main.css';
```

**Key Elements Explanation**:

| Element | Purpose |
|---------|---------|
| `createRoot()` | React 18 API that creates a root for rendering components |
| `CrimeLeaderApp` | Main app component containing all UI logic |
| `initializeServices()` | Initializes Web3, IPFS, API, and storage services |
| `WalletProvider` | Context that manages wallet connection state across the app |
| `main.css` | Tailwind CSS + custom styling imports |

**Initialization Flow**:
```javascript
// 1. Initialize services first (Web3, IPFS, API)
const initResult = await initializeServices();

// 2. Render app with WalletProvider wrapper
root.render(
    <React.StrictMode>
        <WalletProvider>
            <CrimeLeaderApp />
        </WalletProvider>
    </React.StrictMode>
);

// 3. Error handling with graceful degradation
// If services fail, app still renders but with limited functionality
```

**Service Initialization Sequence**:
- ✅ Web3 Service (MetaMask/Wallet detection)
- ✅ IPFS/Storage Service (Evidence file upload)
- ✅ API Service (Backend communication)
- ✅ Contract Service (Smart contract interaction)

---

### 2. Main Application Component: `src/CrimeLeader.jsx`

**Purpose**: Central hub that manages all user roles and routing logic. This is the largest component (~1084 lines).

**Component Structure**:

```jsx
const CrimeLeaderApp = () => {
    // STATE MANAGEMENT
    const [account, setAccount] = useState(null);        // Connected wallet address
    const [role, setRole] = useState(null);              // User role (0=Admin, 1=Officer, 2=Citizen)
    const [isAdmin, setIsAdmin] = useState(false);       // Is user an admin?
    const [activeTab, setActiveTab] = useState('dashboard'); // Current UI tab
    const [loading, setLoading] = useState(false);       // Show loading spinner
    const [error, setError] = useState(null);            // Display error messages
    const [success, setSuccess] = useState(null);        // Show success notifications
```

**Key State Variables**:

| State Variable | Type | Purpose |
|---|---|---|
| `account` | string | Current MetaMask wallet address |
| `role` | number | 0=Admin, 1=Officer, 2=Citizen |
| `isAdmin` | boolean | Quick check if user is admin |
| `pendingOfficers` | array | Officers awaiting admin approval |
| `firs` | array | All First Information Reports |
| `activeTab` | string | Current visible tab (dashboard, fir, review, etc.) |
| `selectedFIR` | object | Currently selected FIR for viewing/editing |
| `firData` | object | Form data for creating new FIR |
| `officerCredentials` | array | Stored officer login information |

**Role-Based UI Rendering Logic**:

```jsx
// The component uses role-based conditional rendering
// Role 0 = Admin (sees approval dashboard)
// Role 1 = Officer (sees FIR submission and review)
// Role 2 = Citizen (sees FIR filing and viewing)

{!account ? (
    <ConnectWallet onConnect={handleWalletConnection} />
) : role === 0 ? (
    <AdminDashboard account={account} />
) : role === 1 ? (
    <OfficerReview />
) : (
    <FileFIR />
)}
```

**Critical Functions in CrimeLeader.jsx**:

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `handleWalletConnection()` | address | sets account state | Connects MetaMask wallet |
| `loadPendingOfficers()` | none | updates state | Fetches pending officer approvals |
| `handleFIRSubmission()` | formData | transaction | Files new FIR to blockchain |
| `handleFIRApproval()` | firId | transaction | Approves FIR (officer action) |
| `handleFIRRejection()` | firId, reason | transaction | Rejects FIR with reason |
| `fetchAllFIRs()` | none | updates state | Loads all FIRs from backend |
| `setActiveTab()` | tabName | displays UI | Switches between tabs |

---

### 3. Wallet Provider Context: `src/contexts/WalletProvider.jsx`

**Purpose**: Manages wallet connection state globally for all components.

```jsx
const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);           // Current account address
    const [networkName, setNetworkName] = useState('');     // Network (Mainnet, Sepolia, etc.)
    const [isConnecting, setIsConnecting] = useState(false); // Is connection in progress?
```

**Context Methods**:

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `connect()` | none | address | Requests wallet connection via MetaMask |
| `disconnect()` | none | void | Disconnects wallet and clears state |
| `refreshNetwork()` | none | void | Updates network name (Sepolia/Mainnet) |
| `signTypedData()` | message, types | signature | Signs EIP-712 typed data |

**Event Listeners** (automatically updates state):
```javascript
window.addEventListener('web3AccountChanged', onAccountChanged);
// Fires when user switches accounts in MetaMask

window.addEventListener('web3Disconnected', onDisconnected);
// Fires when wallet disconnects
```

**Usage in Components**:
```jsx
const { account, connect, signTypedData, web3Service } = useWallet();

// Connect wallet
const address = await connect();

// Sign data
const signature = await signTypedData(message);
```

---

### 4. Login Component: `src/components/LoginPage.jsx`

**Purpose**: Officers login with username/password and MetaMask signature.

**UI Elements**:

```jsx
<div className="max-w-md w-full">
    {/* Header Section */}
    <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-br from-emerald-500/20 
                        to-emerald-600/20 rounded-xl border border-emerald-500/30">
            <svg>Shield Icon</svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Officer Login</h2>
    </div>

    {/* Form Section */}
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label>Username or Badge Number</label>
            <input
                type="text"
                className="police-input" {/* Custom CSS class */}
                placeholder="Enter your username"
            />
        </div>
```

**Login Workflow**:

```
1. User enters username/password
2. Component requests MetaMask account
   → window.ethereum.request({ method: 'eth_requestAccounts' })
3. MetaMask popup shows → User confirms
4. Gets wallet address (e.g., 0x1234...5678)
5. Calls backend API: loginOfficer(walletAddress, password)
6. Backend verifies credentials in MongoDB
7. Returns JWT token
8. App stores token and sets officer role
```

**Form Fields**:

| Field | Type | Validation | Purpose |
|-------|------|-----------|---------|
| `username` | text | Required | Officer badge number or ID |
| `password` | password | Required | Account password (hashed in DB) |

---

### 5. File FIR Component: `src/components/FileFIR.jsx`

**Purpose**: Allows officers and citizens to file First Information Reports with evidence upload.

**Form State Structure**:

```jsx
const [formData, setFormData] = useState({
    title: '',                    // FIR title
    complainantName: '',          // Person filing complaint
    complainantAddress: '',       // Address of complainant
    incidentDate: '',             // When incident occurred
    incidentLocation: '',         // Where incident occurred
    description: '',              // Detailed description
    evidenceFiles: [],            // Array of uploaded files
    witnesses: '',                // Witness names/contact
    timeOfIncident: ''            // Time of incident
});
```

**File Upload Constraints**:

```javascript
const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
];
const maxFileSize = 50 * 1024 * 1024; // 50MB per file
```

**FIR Submission Process**:

```
1. User fills form with incident details
2. Uploads evidence files (images, videos, PDFs)
3. Component uploads files to IPFS → Returns CIDs
4. Computes hash of all CIDs (evidenceRoot)
5. Creates EIP-712 typed data with:
   - FIR details
   - Evidence root hash
   - Timestamp
6. User signs with MetaMask
7. Sends to backend with signature
8. Backend verifies EIP-712 signature
9. Stores FIR in MongoDB
10. Creates transaction on smart contract
```

**Key Functions**:

| Function | Purpose |
|----------|---------|
| `handleInputChange(e)` | Updates form field in state |
| `handleFileChange(e)` | Captures uploaded files |
| `handleSubmit(e)` | Validates and submits FIR |
| `uploadEvidenceFiles()` | Uploads to IPFS, returns CIDs |
| `createEIP712Signature()` | Signs FIR data cryptographically |

---

### 6. Admin Dashboard: `src/components/AdminDashboard.jsx`

**Purpose**: Admin interface to approve/reject pending officer registrations.

**Component Features**:

```jsx
const [pendingOfficers, setPendingOfficers] = useState([]);  // Officers awaiting approval
const [loadingOfficerId, setLoadingOfficerId] = useState(null); // Which officer is loading
const [rejectionReason, setRejectionReason] = useState({});   // Reason to reject
const [showRejectForm, setShowRejectForm] = useState({});     // Show rejection form toggle
```

**Admin Actions**:

| Action | API Call | Effect |
|--------|----------|--------|
| **Approve Officer** | `POST /officers/approve/:id` | Sets officer status to "approved" in MongoDB, enables FIR filing |
| **Reject Officer** | `POST /officers/reject/:id` | Sets status to "rejected", removes from pending list |
| **View Pending** | `GET /officers/pending` | Loads all officers with status="pending" |

**UI Flow**:

```
Admin Dashboard renders:
1. List of pending officers with details:
   - Officer ID
   - Badge Number
   - Department
   - Registration date
2. For each officer, two buttons:
   - [Approve] → Immediate approval
   - [Reject] → Shows form for rejection reason
3. Auto-polls backend every 30 seconds for new officers
```

**Polling Logic**:

```javascript
useEffect(() => {
    // Load immediately on component mount
    loadPendingOfficers();
    
    // Poll every 30 seconds for new registrations
    const interval = setInterval(loadPendingOfficers, 30000);
    
    // Cleanup when component unmounts
    return () => clearInterval(interval);
}, []);
```

---

### 7. Officer Review Component: `src/components/OfficerReview.jsx`

**Purpose**: Officers review and verify FIRs filed by citizens.

**Review States**:

```
Unsigned (initial)
    ↓
[Officer Reviews Details & Evidence]
    ↓
├─→ Approved (signs with wallet)
│   └─→ Added to blockchain as verified
│
└─→ Rejected (with reason)
    └─→ Sent back to filer
```

**Review Form Fields**:

| Field | Type | Purpose |
|-------|------|---------|
| `officerNotes` | textarea | Officer's observations |
| `signature` | text | Officer's digital signature |
| `status` | dropdown | Approved/Rejected/Pending |

---

### 8. Button Component: `src/components/Button.jsx`

**Purpose**: Reusable button component with consistent styling.

**Props**:

```jsx
<Button
    onClick={() => handleClick()}    // Click handler
    disabled={isLoading}             // Disable button
    className="custom-class"         // Additional CSS classes
    type="button"                    // button, submit, reset
    variant="primary"                // primary, secondary, danger
>
    Click Me
</Button>
```

**Variants**:
- `primary`: Blue background (main actions)
- `secondary`: Light background (secondary actions)
- `danger`: Red background (destructive actions)

---

### 9. Badge Component: `src/components/Badge.jsx`

**Purpose**: Display status badges with color coding.

```jsx
<Badge status="approved" text="Approved" />
<Badge status="pending" text="Pending Review" />
<Badge status="rejected" text="Rejected" />
```

**Status Colors**:

| Status | Color | Meaning |
|--------|-------|---------|
| `approved` | Green | ✅ FIR/Officer approved |
| `pending` | Yellow | ⏳ Awaiting review |
| `rejected` | Red | ❌ Rejected |
| `verified` | Blue | ✓ Verified on blockchain |

---

### 10. Loading Spinner: `src/components/LoadingSpinner.jsx`

**Purpose**: Shows loading animation during async operations.

```jsx
<LoadingSpinner 
    message="Filing FIR..." 
    progress={45}  // Optional: show 45% complete
/>
```

---

### 11. Web3 Service: `src/services/web3/index.js`

**Purpose**: Manages blockchain interactions and MetaMask connection.

**Core Methods**:

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `initialize()` | none | boolean | Initializes Web3 with MetaMask |
| `connectWallet()` | none | address | Requests wallet connection |
| `getCurrentAccount()` | none | address or null | Gets current connected account |
| `getChainId()` | none | number | Gets current blockchain chain ID |
| `disconnect()` | none | void | Disconnects wallet |
| `signTypedData()` | domain, types, value | signature | Signs EIP-712 typed data |

**Chain IDs**:

```javascript
11155111 → Sepolia (Ethereum testnet)
1        → Ethereum Mainnet
5        → Goerli (deprecated testnet)
```

---

### 12. Contract Service: `src/services/web3/contracts.js`

**Purpose**: Abstracts smart contract interactions.

**Key Methods**:

```javascript
async callContractMethod(contract, methodName, ...args)
// Read-only calls (view/pure functions)
const isApproved = await callContractMethod(
    firContract, 
    'isOfficerApproved', 
    officerAddress
);

async sendContractTransaction(contract, methodName, fromAddress, ...args)
// State-changing transactions
const receipt = await sendContractTransaction(
    firContract,
    'fileFIR',
    userAddress,
    ipfsHash,
    signature,
    citizenAddress
);

subscribeToEvents(contract, eventName, callback)
// Listen for contract events
subscribeToEvents(firContract, 'FIRFiled', (err, event) => {
    if (!err) console.log('New FIR filed:', event);
});

async getPastEvents(contract, eventName, options)
// Get historical events
const pastFIRs = await getPastEvents(firContract, 'FIRFiled', {
    fromBlock: 0,
    toBlock: 'latest'
});
```

---

### 13. API Service: `src/services/api/index.js`

**Purpose**: Centralized HTTP client for backend API calls.

**Methods**:

```javascript
// Officer endpoints
api.registerOfficer(data)
api.loginOfficer(walletAddress, password)
api.getPendingOfficers()
api.approveOfficer(officerId)
api.rejectOfficer(officerId, reason)

// FIR endpoints
api.createFIR(firData)
api.getAllFIRs()
api.getFIRById(id)
api.updateFIR(id, data)
api.approveFIR(id, notes)
api.rejectFIR(id, reason)

// File endpoints
api.uploadFile(file)
api.downloadFile(hash)

// Generic methods
api.get(url)
api.post(url, data)
api.put(url, data)
api.delete(url)
```

**Error Handling**:

```javascript
try {
    const result = await api.loginOfficer(address, password);
    if (result.success) {
        // Handle success
    } else {
        // result.message contains error
    }
} catch (error) {
    // Network error or parsing error
}
```

---

### 14. Storage/IPFS Service: `src/services/hybridStorage.js`

**Purpose**: Upload evidence files to IPFS and store metadata.

**Key Methods**:

```javascript
// Initialize IPFS connection
await storage.initialize()

// Upload files to IPFS
const hashes = await storage.uploadEvidenceFiles(firId, fileArray)
// Returns: [{ name, ipfsHash, size, type }, ...]

// Download from IPFS
const fileData = await storage.downloadFile(ipfsHash)

// Delete (pinned) file
await storage.deleteFile(ipfsHash)

// Get file metadata
const metadata = await storage.getFileMetadata(ipfsHash)
```

**File Upload Response**:

```javascript
{
    name: "crime_photo.jpg",
    ipfsHash: "QmXxxx...",
    size: 1024000,
    type: "image/jpeg",
    uploadTime: "2025-01-15T10:30:00Z",
    mimeType: "image/jpeg"
}
```

---

## FRONTEND CSS STYLING

### 1. Global CSS Variables: `src/styles/main.css`

```css
:root {
    --color-primary: #1E3A8A;    /* Deep blue - primary theme */
    --color-secondary: #FFB100;   /* Golden yellow - accent */
    --color-accent: #3B82F6;     /* Bright blue - interactive */
    --color-surface: #0F172A;    /* Dark navy - backgrounds */
    --color-text: #F8FAFC;       /* Light gray - text */
    --color-error: #EF4444;      /* Red - errors */
    --color-success: #22C55E;    /* Green - success */
}
```

**Why These Colors?**
- Police/law enforcement theme: Deep blues, professional gold
- High contrast for readability
- Accessible for color-blind users

### 2. Glassmorphism Effect

```css
.glass-effect {
    background: rgba(30, 58, 138, 0.1);      /* Semi-transparent blue */
    backdrop-filter: blur(8px);               /* Blur background */
    -webkit-backdrop-filter: blur(8px);       /* Safari support */
    border: 1px solid rgba(255, 177, 0, 0.1); /* Subtle gold border */
}
```

**Visual Result**: Frosted glass appearance with blurred background visible through semi-transparent card.

### 3. Custom Component Classes

#### `.police-card`
```css
@apply glass-effect rounded-lg p-6 shadow-lg 
       transition-all duration-300 hover:shadow-xl 
       hover:scale-[1.01];
```
**Applied to**: FIR cards, officer listings, dashboard panels  
**Effect**: 
- Glass background with blur
- 6px padding
- Smooth shadow and scale on hover
- Grows slightly when user hovers

#### `.police-input`
```css
@apply bg-blue-900/20 border border-yellow-500/20 rounded-lg 
       px-4 py-2 text-white focus:outline-none 
       focus:border-yellow-500/40 focus:ring-2 
       focus:ring-yellow-500/20 transition-all duration-200;
```
**Applied to**: Form inputs, search bars  
**States**:
- Normal: Semi-transparent blue background
- Focus: Gold border appears, golden ring around input
- Disabled: Opacity reduced

#### `.police-button`
```css
@apply bg-blue-600 text-white px-6 py-2 rounded-lg
       hover:bg-blue-700 active:bg-blue-800 
       disabled:opacity-50 disabled:cursor-not-allowed
       transition-all duration-200 ease-in-out
       focus:outline-none focus:ring-2 focus:ring-blue-500/50;
```
**States**:
- Normal: Blue background
- Hover: Darker blue
- Active: Even darker (pressed effect)
- Disabled: Faded, cursor changes to "not-allowed"
- Focus: Ring appears (keyboard navigation)

#### `.stat-card`
```css
@apply police-card flex flex-col justify-center items-center 
       text-center hover:border-yellow-500/30;
```
**Used for**: Statistics display (total FIRs, officers, etc.)  
**Behavior**: Centers content, adds gold border on hover

#### `.fir-card`
```css
@apply police-card hover:border-yellow-500/30;
```
**Used for**: Individual FIR display in lists  
**Behavior**: Gold border appears on hover

### 4. Navigation Styling

#### `.nav-link`
```css
@apply text-gray-300/80 px-4 py-2 border-b-2 border-transparent
       hover:text-white hover:border-yellow-500/40 
       transition-all duration-200;
```
**State Transitions**:
- Inactive: Gray text, transparent border
- Hover: White text, gold border fades in
- Active: White text, solid gold border

### 5. Custom Scrollbar

```css
::-webkit-scrollbar {
    width: 8px;              /* Thin scrollbar */
}

::-webkit-scrollbar-track {
    background: var(--color-surface);  /* Navy background */
}

::-webkit-scrollbar-thumb {
    background: var(--color-accent);   /* Blue thumb */
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--color-secondary);  /* Gold on hover */
}
```

### 6. Utility Classes

#### `.text-gradient`
```css
@apply bg-clip-text text-transparent 
       bg-gradient-to-r from-yellow-400 to-orange-500;
```
**Effect**: Text with yellow-to-orange gradient  
**Used for**: Headings, emphasis text

#### `.bg-gradient`
```css
@apply bg-gradient-to-br from-blue-900 to-blue-950;
```
**Effect**: Background gradient from lighter to darker blue  
**Used for**: Page backgrounds, hero sections

#### Text/Background Color Utilities
```css
.text-police-gold     → color: #FFB100
.text-police-light    → color: #F8FAFC
.bg-police-navy       → background: #1E3A8A
.bg-police-dark-blue  → background: #0F172A
```

### 7. Tailwind CSS Integration

The project uses Tailwind CSS for utility-first styling:

```html
<div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
    <!--
    flex             → display: flex
    items-center     → align-items: center
    justify-between  → justify-content: space-between
    p-4              → padding: 1rem (16px)
    bg-slate-800     → background-color: slate gray
    rounded-lg       → border-radius: 8px
    -->
</div>
```

---

## BACKEND JAVASCRIPT CODE

### 1. Server Setup: `server/server.js`

**Purpose**: Initialize Express.js server, configure middleware, set up routes.

**Core Configuration**:

```javascript
require('dotenv').config();                    // Load .env variables
const express = require('express');            // Web framework
const mongoose = require('mongoose');          // MongoDB ORM
const { errorHandler } = require('./middlewares/errorHandler');
const configureSecurityMiddleware = require('./middlewares/security');

const app = express();

// Security headers and protections
configureSecurityMiddleware(app);

// Parsing middleware
app.use(express.json({ limit: '10mb' }));           // Parse JSON up to 10MB
app.use(express.urlencoded({ extended: true }));   // Parse form data
```

**Routes Registration**:

```javascript
app.use('/api/firs', require('./routes/fir-files'));      // File upload routes
app.use('/api/firs', require('./routes/firs'));           // FIR CRUD routes
app.use('/api/officers', require('./routes/officers'));   // Officer management
```

**Health Check Endpoint**:

```javascript
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',                                    // Server is running
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()             // Server time
    });
});
```

**MongoDB Connection**:

```javascript
const connectDB = async () => {
    const maxRetries = 5;
    let retryCount = 0;
    
    // Retry logic: if connection fails, try again up to 5 times
    const tryConnect = async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                dbName: 'crimeledger',
                serverSelectionTimeoutMS: 5000,     // 5 second timeout
                connectTimeoutMS: 10000              // 10 second connection timeout
            });
            console.log('✅ MongoDB connected');
        } catch (error) {
            console.error('❌ Connection failed, retrying...');
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryConnect, 3000);  // Retry after 3 seconds
            }
        }
    };
    
    await tryConnect();
};
```

---

### 2. Officer Model: `server/models/Officer.js`

**Purpose**: Define officer database schema and validation.

**Database Schema**:

```javascript
const OfficerSchema = new mongoose.Schema({
    walletAddress: {
        type: String,           // Ethereum address
        required: true,
        unique: true,           // Only one officer per address
        lowercase: true         // Normalize addresses
    },
    password: {
        type: String,
        required: true          // Hashed with bcrypt
    },
    officerId: {
        type: String,
        required: true,
        unique: true            // Badge/ID number
    },
    name: String,               // Officer's full name
    badgeNumber: String,        // Police badge number
    department: String,         // Police department
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'      // Starts as pending
    },
    role: {
        type: String,
        default: 'officer'      // Can be 'admin' or 'officer'
    },
    createdAt: {
        type: Date,
        default: Date.now       // Automatic timestamp
    },
    approvedBy: {
        type: String,
        ref: 'Officer'          // Reference to approving officer
    },
    approvedAt: Date            // When approval happened
});
```

**Password Hashing (Pre-save Hook)**:

```javascript
OfficerSchema.pre('save', async function(next) {
    // Skip if password wasn't modified
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);              // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash password
        next();
    } catch (error) {
        next(error);
    }
});
```

**Method**: `comparePassword()`

```javascript
OfficerSchema.methods.comparePassword = async function(candidatePassword) {
    // Compare plaintext password with hashed password
    return await bcrypt.compare(candidatePassword, this.password);
};
```

**Usage**:
```javascript
const officer = await Officer.findOne({ walletAddress: address });
const isMatch = await officer.comparePassword('userPassword');  // true/false
```

---

### 3. FIR Model: `server/models/FIR.js`

**Purpose**: Define FIR database schema with evidence references.

**Schema Structure**:

```javascript
const FIRSchema = new mongoose.Schema({
    firId: {
        type: String,
        required: true,
        unique: true            // Unique identifier like "FIR-1702600000123"
    },
    title: String,              // FIR title
    description: String,        // Incident description
    location: String,           // Where incident occurred
    date: Date,                 // Incident date
    time: String,               // Incident time
    witnesses: String,          // Witness information
    evidence: String,           // Evidence notes
    
    // Evidence files with metadata
    evidenceFiles: [{
        name: String,           // Original filename
        type: String,           // MIME type
        size: Number,           // File size in bytes
        uploadTime: Date,       // Upload timestamp
        ipfsHash: String,       // IPFS content hash
        mimeType: String        // MIME type again
    }],
    
    requester: String,          // Who filed the FIR (name/address)
    
    // Status tracking
    status: {
        type: Number,
        enum: [0, 1, 2],        // 0=Pending, 1=Processing, 2=Filed
        default: 0
    },
    statusLabel: {
        type: String,
        enum: ['pending', 'processing', 'filed', 'rejected'],
        default: 'pending'
    },
    
    // Officer review
    officerId: String,          // Officer who reviewed
    officerSignature: String,   // Officer's digital signature
    officerNotes: String,       // Officer's comments
    
    // Public review (for peer review)
    publicReview: {
        state: {
            type: String,
            enum: ['unsigned', 'approved', 'rejected'],
            default: 'unsigned'
        },
        reviewer: {
            walletAddress: String,
            officerId: String,
            name: String
        },
        reviewedAt: Date,
        reviewNotes: String,
        onChainTxHash: String   // Blockchain transaction hash
    },
    
    // IPFS references
    publicDataCID: String,      // IPFS content ID
    ipfsMetadataHash: String    // Metadata hash
});
```

---

### 4. Officer Routes: `server/routes/officers.js`

**Purpose**: Handle officer registration, login, and approval.

#### Endpoint 1: `POST /api/officers/register`

**Request Body**:
```javascript
{
    walletAddress: "0x1234...5678",      // MetaMask address
    password: "SecurePassword123",        // Officer password
    officerId: "PL-001234",              // Badge/ID
    name: "John Smith",                  // Full name
    badgeNumber: "1234",                 // Badge number
    department: "Central Police",        // Department
    signature: "0x7891..."               // MetaMask signature
}
```

**Process**:
```
1. Verify Ethereum signature
   → User must sign message with MetaMask
   → Backend recovers signer address
   → Must match walletAddress

2. Check if already registered
   → Query MongoDB for walletAddress or officerId
   → Return error if exists

3. Hash password with bcrypt
   → Salt cost: 10
   → Securely store in MongoDB

4. Create Officer document
   → status: 'pending' (awaiting admin approval)
   → Save to MongoDB

5. Return success message
```

**Response**:
```javascript
{
    message: "Registration successful. Waiting for admin approval.",
    officerId: "PL-001234"
}
```

**Error Cases**:
- Invalid signature → `401 Unauthorized`
- Already registered → `400 Bad Request`
- Missing fields → `400 Bad Request`

#### Endpoint 2: `POST /api/officers/login`

**Request Body**:
```javascript
{
    walletAddress: "0x1234...5678",
    password: "SecurePassword123",
    signature: "0x7891..."             // Message signature
}
```

**Verification Steps**:
```
1. Verify MetaMask signature
   → Recover signer from signature
   → Must match walletAddress

2. Find officer in MongoDB
   → Query by walletAddress
   → Return 401 if not found

3. Verify password
   → Use bcrypt.compare()
   → Return 401 if mismatch

4. Check approval status
   → Must be 'approved'
   → Return 401 if 'pending' or 'rejected'

5. Generate JWT token
   → Payload: { id, role, walletAddress, officerId }
   → Expires: 24 hours
   → Secret: JWTTOKEN (from .env)

6. Return token
```

**Response**:
```javascript
{
    success: true,
    token: "eyJhbGciOiJIUzI1NiIs...",
    officer: {
        _id: "507f1f77bcf86cd799439011",
        officerId: "PL-001234",
        name: "John Smith",
        role: "officer",
        walletAddress: "0x1234...5678"
    }
}
```

#### Endpoint 3: `GET /api/officers/pending`

**Purpose**: Get all officers awaiting admin approval.

**Query**:
```javascript
const pendingOfficers = await Officer.find({ status: 'pending' });
```

**Response**:
```javascript
[
    {
        _id: "507f1f77bcf86cd799439011",
        officerId: "PL-001234",
        name: "John Smith",
        badgeNumber: "1234",
        department: "Central",
        status: "pending",
        createdAt: "2025-01-15T10:30:00Z"
    },
    // ... more officers
]
```

#### Endpoint 4: `POST /api/officers/approve/:id`

**Route Parameter**:
- `id`: Officer MongoDB ID

**Request Body**:
```javascript
{
    approvedBy: "0x9999...8888"  // Admin's wallet address
}
```

**Action**:
```javascript
await Officer.findByIdAndUpdate(id, {
    status: 'approved',
    approvedBy: req.body.approvedBy,
    approvedAt: new Date()
});
```

**Response**: Success message

---

### 5. FIR Routes: `server/routes/firs.js`

**Purpose**: Create, list, and manage First Information Reports.

#### Endpoint 1: `POST /api/firs`

**Request Body**:
```javascript
{
    firId: "FIR-1702600000123",
    title: "Theft case",
    description: "Burglary at residence",
    location: "123 Main Street",
    date: "2025-01-15T10:30:00Z",
    time: "14:30",
    requester: "John Doe",
    witnesses: "Jane Smith, Bob Johnson",
    
    // IPFS hashes
    ipfsHash: "QmXxxx...",           // Main FIR data
    publicDataCID: "bafyxxx...",     // Evidence files
    
    // EIP-712 signature verification
    signature: {
        signature: "0x7891...",       // Signature bytes
        signer: "0x1234...5678",      // Signer address
        domain: {
            name: "CrimeLedger",
            version: "1",
            chainId: 11155111,
            verifyingContract: "0x..."
        },
        payload: {
            firId: "FIR-1702600000123",
            title: "Theft case",
            // ... all FIR fields
        }
    }
}
```

**EIP-712 Signature Verification**:

```javascript
// Recover signer from EIP-712 signature
const domain = signature.domain;
const types = {
    EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
    ],
    FIR: [
        { name: 'firId', type: 'string' },
        { name: 'title', type: 'string' },
        // ... all FIR fields
    ]
};

const recoveredSigner = ethers.utils.verifyTypedData(
    domain,
    types,
    signature.payload,
    signature.signature
);

// Ensure signer matches claimed address
if (recoveredSigner !== signature.signer) {
    throw new Error('Signature mismatch');
}
```

**Process**:
```
1. Validate EIP-712 signature
2. Verify IPFS hashes provided
3. Create FIR document in MongoDB
4. Link to blockchain transaction
5. Return FIR with ID
```

#### Endpoint 2: `GET /api/firs`

**Purpose**: Get all FIRs (or filtered list).

**Query Parameters**:
```
?status=pending        → Only pending FIRs
?requester=JohnDoe    → FIRs by specific person
?location=MainSt      → FIRs at location
```

**Response**:
```javascript
[
    {
        firId: "FIR-1702600000123",
        title: "Theft case",
        description: "...",
        status: 0,              // 0=Pending, 1=Processing, 2=Filed
        requester: "John Doe",
        createdAt: "2025-01-15T10:30:00Z",
        evidenceFiles: [
            {
                name: "crime_photo.jpg",
                ipfsHash: "QmXxxx...",
                size: 1024000
            }
        ]
    }
]
```

#### Endpoint 3: `GET /api/firs/:id`

**Purpose**: Get specific FIR details.

**Response**: Single FIR document with all fields.

#### Endpoint 4: `PUT /api/firs/:id`

**Purpose**: Update FIR (add notes, change status, etc.).

**Request Body**:
```javascript
{
    officerNotes: "Initial investigation complete",
    status: 1,              // Change to Processing
    officerId: "PL-001234"
}
```

---

### 6. Authentication Middleware: `server/middlewares/auth.js`

**Purpose**: Verify JWT token and authorize requests.

**Middleware Functions**:

```javascript
const auth = (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    // Format: "Bearer eyJhbGc..."
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach to request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};
```

**Usage in Routes**:
```javascript
router.post('/approve/:id', auth, authorize(['admin']), (req, res) => {
    // Only authenticated admins can approve officers
});
```

---

### 7. Security Middleware: `server/middlewares/security.js`

**Purpose**: Implement security headers and protections.

**Features**:

```javascript
app.use(helmet());              // Set secure HTTP headers
app.use(cors());                // Enable CORS
app.use(rateLimit({            // Rate limiting
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 100                     // 100 requests per window
}));

app.use(mongoSanitize());       // Prevent NoSQL injection
app.use(hpp());                 // Prevent parameter pollution

// Custom headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

---

### 8. Error Handler Middleware: `server/middlewares/errorHandler.js`

**Purpose**: Centralized error handling.

```javascript
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    console.error(`[${statusCode}] ${message}`);
    
    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};
```

**Error Types**:
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `500`: Server Error

---

### 9. IPFS/Pinata Service: `server/services/pinataService.js`

**Purpose**: Upload and manage files on IPFS via Pinata.

**Configuration**:
```javascript
const pinata = new PinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY
});
```

**Methods**:

```javascript
// Upload file to IPFS
async uploadFile(file, metadata) {
    const stream = fs.createReadStream(file.path);
    const response = await pinata.pinFileToIPFS(stream, {
        pinataMetadata: metadata
    });
    return response.IpfsHash;  // Returns: QmXxxx...
}

// Upload JSON metadata
async uploadJSON(data) {
    const response = await pinata.pinJSONToIPFS(data, {
        pinataMetadata: { name: 'FIR Metadata' }
    });
    return response.IpfsHash;
}

// Retrieve from IPFS
async getFile(ipfsHash) {
    // Fetch from gateway
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return await response.blob();
}
```

---

## SMART CONTRACTS (SOLIDITY)

### 1. Access Control: `contracts/AccessControl.sol`

**Purpose**: Base contract managing admin privileges with recovery mechanism.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl {
    address public admin;                      // Current admin address
    address public pendingAdmin;               // Admin being transferred to
    uint256 public constant ADMIN_RECOVERY_PERIOD = 7 days;  // Recovery delay
    uint256 public adminRecoveryInitiated;     // Recovery start time
    address public adminRecoveryCandidate;     // Recovery candidate address
```

**Key Functions**:

| Function | Parameters | Effect |
|----------|-----------|--------|
| `constructor()` | none | Sets deployer as initial admin |
| `transferAdmin(newAdmin)` | address | Initiates admin transfer (2-step process) |
| `acceptAdminRole()` | none | Pending admin accepts transfer |
| `initiateAdminRecovery(candidate)` | address | Starts 7-day recovery period |
| `completeAdminRecovery()` | none | Completes recovery after 7 days |
| `cancelAdminRecovery()` | none | Cancels ongoing recovery |

**Admin Recovery Mechanism**:

```
SCENARIO: Admin loses private key

1. New candidate calls initiateAdminRecovery()
   → Sets recovery timer to now + 7 days
   → Emits: AdminRecoveryInitiated event

2. Wait 7 days (ADMIN_RECOVERY_PERIOD)

3. Call completeAdminRecovery()
   → Requires 7 days have passed
   → Requires msg.sender == candidate
   → Updates admin to candidate
   → Clears recovery state
```

**Events**:

```solidity
event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
event AdminRecoveryInitiated(address indexed candidate, uint256 recoveryDeadline);
event AdminRecoveryCancelled();
event AdminRecoveryCompleted(address indexed newAdmin);
```

---

### 2. Citizen Management: `contracts/CitizenManagement.sol`

**Purpose**: Register and track citizens who can file FIRs.

```solidity
pragma solidity ^0.8.0;

contract CitizenManagement {
    struct Citizen {
        bool isRegistered;              // Registration status
        string citizenId;               // Citizen ID (e.g., passport, ID card)
        uint256 registrationTime;       // When registered
    }
    
    mapping(address => Citizen) public citizens;  // address → Citizen data
```

**Key Functions**:

| Function | Parameters | Effect |
|----------|-----------|--------|
| `registerCitizen(citizenId)` | string | Register caller as citizen |
| `isCitizenRegistered(citizen)` | address | Check if address is registered |

**Registration Logic**:

```
Flow: registerCitizen()

1. Requires: !citizens[msg.sender].isRegistered
   → Prevent double registration

2. Creates Citizen struct:
   {
       isRegistered: true,
       citizenId: _citizenId,
       registrationTime: block.timestamp
   }

3. Emits: CitizenRegistered(address, citizenId)

4. Next: Citizen can now file FIRs
```

**Events**:

```solidity
event CitizenRegistered(address indexed citizenAddress, string citizenId);
```

---

### 3. Officer Management: `contracts/OfficerManagement.sol`

**Purpose**: Manage officer registration, approval, and revocation.

```solidity
pragma solidity ^0.8.0;

import "./AccessControl.sol";  // Inherits admin checks

contract OfficerManagement is AccessControl {
    struct Officer {
        bool isRegistered;          // Registered?
        bool isApproved;            // Admin approved?
        string officerId;           // Badge number
        uint256 registrationTime;   // When registered
        bool isRevoked;             // Status revoked?
        uint256 revocationTime;     // When revoked
    }
    
    mapping(address => Officer) public officers;  // address → Officer
    
    modifier onlyApprovedOfficer() {
        require(officers[msg.sender].isApproved, "Not approved officer");
        require(!officers[msg.sender].isRevoked, "Officer revoked");
        _;
    }
```

**Key Functions**:

| Function | Parameters | Effect | Who Can Call |
|----------|-----------|--------|--------------|
| `registerOfficer(officerId)` | string | Register officer (pending) | Anyone |
| `approveOfficer(officerAddress)` | address | Approve officer | Admin only |
| `revokeOfficer(officerAddress)` | address | Revoke officer | Admin only |
| `isOfficerApproved(officer)` | address | Check approval status | Anyone (view) |

**Officer Lifecycle**:

```
1. REGISTRATION (Anyone)
   registerOfficer("PL-001234")
   → Creates Officer with isApproved = false
   → Status: Pending

2. ADMIN APPROVAL (Admin only)
   approveOfficer(0x1234...5678)
   → Sets isApproved = true
   → Status: Active
   → Officer can now file/verify FIRs

3. REVOCATION (Admin only)
   revokeOfficer(0x1234...5678)
   → Sets isRevoked = true
   → Officer loses all privileges
   → Cannot file/verify FIRs anymore

4. STATE CHECK
   isOfficerApproved() → true only if approved AND not revoked
```

**Events**:

```solidity
event OfficerRegistered(address indexed officerAddress, string officerId);
event OfficerApproved(address indexed officerAddress);
event OfficerRevoked(address indexed officerAddress, uint256 timestamp);
```

---

### 4. FIR System (Main): `contracts/FIRSystem.sol`

**Purpose**: Core FIR filing, verification, rejection, and amendment logic.

```solidity
pragma solidity ^0.8.0;

import "./OfficerManagement.sol";
import "./CitizenManagement.sol";

contract FIRSystem is OfficerManagement, CitizenManagement {
    // Inheritance chain:
    // FIRSystem → OfficerManagement → AccessControl
    // FIRSystem → CitizenManagement
```

**Main Structs**:

```solidity
struct FIR {
    uint256 firId;                  // Unique FIR number
    string ipfsHash;                // IPFS hash of full details
    address officer;                // Officer who filed
    uint256 timestamp;              // Filing timestamp
    string officerSignature;        // Officer's signature
    bool isVerified;                // Another officer verified?
    address verifiedBy;             // Who verified
    uint256 verificationTime;       // When verified
    bool isAmended;                 // Has amendments?
    uint256[] amendmentIds;         // Amendment IDs
    address citizenId;              // Citizen reference
    bool isRejected;                // Rejected?
    string rejectionReason;         // Why rejected
}

struct Amendment {
    uint256 amendmentId;            // Unique amendment ID
    uint256 originalFirId;          // Parent FIR
    string ipfsHash;                // Amendment details
    address officer;                // Officer proposing amendment
    uint256 timestamp;              // Proposal timestamp
    string reason;                  // Reason for amendment
    bool isVerified;                // Another officer verified?
}

mapping(uint256 => FIR) public firs;                 // All FIRs
mapping(uint256 => Amendment) public amendments;     // All amendments
mapping(address => uint256[]) public citizenFIRs;   // Citizen's FIRs
```

**Key Functions**:

#### 1. `fileFIR(ipfsHash, signature, citizenId)`

```
Purpose: File a new FIR
Caller: onlyApprovedOfficer (officer must be approved)

Validation:
- msg.sender must be approved officer
- citizenId must be registered

Process:
1. Increment firCount
2. Create FIR struct:
   {
       firId: firCount,
       ipfsHash: _ipfsHash,              // IPFS link to full details
       officer: msg.sender,              // This officer
       timestamp: block.timestamp,       // Now
       officerSignature: _signature,     // Officer's signature
       isVerified: false,                // Needs verification
       isAmended: false,
       citizenId: _citizenId
   }
3. Add to firs mapping
4. Add to citizenFIRs array
5. Emit FIRFiled event
```

**Example**:
```solidity
// Officer files FIR
firSystem.fileFIR(
    "QmXxxx...",              // IPFS hash
    "0x7891...",              // Officer's signature
    0x1234...5678             // Citizen's address
);
// → FIR ID 1 created, pending verification
```

#### 2. `verifyFIR(firId)`

```
Purpose: Another officer verifies the FIR
Caller: onlyApprovedOfficer

Validation:
- firId must exist
- FIR must not already be verified
- FIR must not be rejected
- msg.sender must NOT be original officer (peer review)

Effect:
- Sets isVerified = true
- Records verifiedBy address
- Sets verificationTime
- Emits FIRVerified event

Result: FIR now approved and on-chain
```

#### 3. `rejectFIR(firId, reason)`

```
Purpose: Officer rejects the FIR
Caller: onlyApprovedOfficer

Validation:
- firId must exist
- FIR must not already be verified
- FIR must not already be rejected
- msg.sender cannot be original officer

Effect:
- Sets isRejected = true
- Stores rejectionReason
- Emits FIRRejected event

Result: FIR marked as invalid
```

#### 4. `amendFIR(firId, ipfsHash, reason)`

```
Purpose: Amend a verified FIR
Caller: onlyApprovedOfficer

Validation:
- firId must exist
- FIR must be isVerified = true
- FIR must NOT be rejected (can't amend rejected FIR)

Process:
1. Increment amendmentCount
2. Create Amendment:
   {
       amendmentId: amendmentCount,
       originalFirId: _firId,
       ipfsHash: _ipfsHash,        // New details
       officer: msg.sender,
       timestamp: block.timestamp,
       reason: _reason,
       isVerified: false           // Needs verification
   }
3. Mark parent FIR: isAmended = true
4. Add amendment to array
5. Emit FIRAmended event

Result: Amendment pending verification
```

#### 5. `verifyAmendment(amendmentId)`

```
Purpose: Another officer verifies amendment
Caller: onlyApprovedOfficer

Validation:
- amendmentId must exist
- Must not already be verified
- msg.sender cannot be original officer

Effect:
- Sets isVerified = true
- Emits event

Result: Amendment approved
```

#### 6. `getFIR(firId)` ← VIEW FUNCTION

```
Purpose: Retrieve FIR details
Returns: All FIR fields (read-only)

Example Response:
{
    firId: 1,
    ipfsHash: "QmXxxx...",
    officer: 0x1234...5678,
    timestamp: 1702600000,
    isVerified: true,
    verifiedBy: 0x9999...8888,
    isAmended: false,
    isRejected: false
}
```

**Events**:

```solidity
event FIRFiled(uint256 indexed firId, address indexed officer, string ipfsHash);
// Fired when officer files FIR

event FIRVerified(uint256 indexed firId, address indexed verifier);
// Fired when another officer verifies

event FIRRejected(uint256 indexed firId, address indexed rejector, string reason);
// Fired when FIR is rejected

event FIRAmended(uint256 indexed firId, uint256 indexed amendmentId, string reason);
// Fired when amendment is proposed
```

---

## DATA FLOW ARCHITECTURE

### 1. Officer Registration Flow

```
FRONTEND (Browser)
    ↓
[Officer enters details & password]
    ↓
[Requests MetaMask signature]
    ↓
[User confirms in MetaMask popup]
    ↓
BACKEND (Node.js)
    ↓
[Verify MetaMask signature]
    ↓
[Hash password with bcrypt]
    ↓
MongoDB
    ↓
[Save Officer document with status: 'pending']
    ↓
BLOCKCHAIN (Solaris testnet)
    ↓
[Smart contract: registerOfficer(officerId)]
    ↓
[Officer state: registered but NOT approved yet]
```

### 2. Officer Approval Flow (Admin)

```
Admin Dashboard
    ↓
[Sees pending officers list]
    ↓
[Clicks "Approve" button]
    ↓
BACKEND
    ↓
[Update MongoDB: status = 'approved']
    ↓
[Add approvedBy and approvedAt fields]
    ↓
BLOCKCHAIN
    ↓
[Smart contract: approveOfficer(officerAddress)]
    ↓
[Officer can now file FIRs]
```

### 3. FIR Filing Flow

```
FRONTEND: FileFIR Component
    ↓
[Officer fills form]
    ├─ Title, description, location
    ├─ Evidence files
    └─ Witness information
    ↓
[Upload evidence files to IPFS]
    ↓
IPFS/Pinata
    ↓
[Returns: [{ ipfsHash: QmXxx, name, size }, ...]]
    ↓
[Compute evidenceRoot = hash(all CIDs)]
    ↓
[Create EIP-712 typed data structure]
    ↓
[User signs with MetaMask]
    ↓
[Gets back: signature bytes]
    ↓
BACKEND: POST /api/firs
    ↓
[Verify EIP-712 signature]
    ↓
[Recover signer address from signature]
    ↓
MongoDB
    ↓
[Save FIR document with:
  - IPFS hash
  - Signature
  - Status: pending
  - Officer reference
]
    ↓
BLOCKCHAIN
    ↓
[Smart contract: fileFIR(ipfsHash, sig, citizenId)]
    ↓
[FIR stored on-chain]
    ↓
[Event: FIRFiled emitted]
    ↓
Frontend detects event
    ↓
Shows: "FIR filed successfully!"
```

### 4. FIR Verification Flow

```
FRONTEND: OfficerReview Component
    ↓
[Officer views pending FIRs]
    ↓
[Reviews: title, description, evidence]
    ↓
[Decides: Approve or Reject]
    ↓
IF APPROVE:
  [Signs with MetaMask]
      ↓
  BLOCKCHAIN
      ↓
  [Smart contract: verifyFIR(firId)]
      ↓
  [Sets: isVerified = true, verifiedBy = msg.sender]
      ↓
  [Event: FIRVerified emitted]
      ↓
  MongoDB
      ↓
  [Update FIR: publicReview.state = 'approved']

IF REJECT:
  [Enters rejection reason]
      ↓
  [Signs with MetaMask]
      ↓
  BLOCKCHAIN
      ↓
  [Smart contract: rejectFIR(firId, reason)]
      ↓
  [Sets: isRejected = true, rejectionReason]
      ↓
  [Event: FIRRejected emitted]
      ↓
  MongoDB
      ↓
  [Update FIR: publicReview.state = 'rejected']
```

---

## Summary Table: What Each Technology Does

| Technology | Purpose | Handles |
|-----------|---------|---------|
| **React** | Frontend UI | User interface, forms, navigation |
| **Tailwind CSS** | Styling | Responsive design, animations, theming |
| **MetaMask** | Wallet | User authentication, signatures |
| **Web3.js** | Blockchain RPC | Communicate with smart contracts |
| **Solidity** | Smart Contracts | Immutable FIR records, role management |
| **Ethers.js** | Signature Verification | Verify EIP-712 signatures on backend |
| **Express.js** | Web Server | API endpoints, business logic |
| **MongoDB** | Database | Persistent data (officers, FIRs, metadata) |
| **IPFS/Pinata** | Decentralized Storage | Store evidence files |
| **bcrypt** | Password Hashing | Secure officer passwords |
| **JWT** | Session Tokens | Authenticate API requests |

---

**End of Complete Code Explanation**

This document explains every significant piece of code in the CrimeLedger system, mapping how frontend components interact with backend APIs, which then interact with the smart contracts and databases.

