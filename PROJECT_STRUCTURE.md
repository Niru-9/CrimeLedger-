# 📁 CrimeLedger - Project Structure Guide

Complete folder organization for the CrimeLedger blockchain FIR management system.

---

## 🎯 Root Level Structure

```
CrimeLeadger-JS/
├── 📄 README.md                    # Main project README - START HERE
├── 📄 00_START_HERE.md            # Navigation hub for all documentation
├── 📄 DOCUMENTATION_INDEX.md       # Alternative navigation guide
│
├── 🔧 Configuration Files
│   ├── package.json               # Node.js dependencies
│   ├── package-lock.json          # Locked dependency versions
│   ├── hardhat.config.js          # Smart contract framework config
│   ├── vite.config.js             # Frontend build config
│   ├── tailwind.config.js         # CSS utility framework config
│   ├── postcss.config.js          # CSS processing config
│   ├── .gitignore                 # Git ignore rules
│   ├── .env                       # Environment variables (template)
│   └── .env.example               # Example env template for users
│
├── 📁 src/                        # React Frontend Application
│   ├── main.jsx                   # React entry point
│   ├── CrimeLeader.jsx            # Main app shell
│   ├── components/                # 12 React components
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminApproval.jsx
│   │   ├── RegistrationFlow.jsx
│   │   ├── LoginPage.jsx
│   │   ├── FileFIR.jsx
│   │   ├── OfficerReview.jsx
│   │   ├── ReviewModal.jsx
│   │   ├── ViewFIR.jsx
│   │   ├── ConnectWallet.jsx
│   │   ├── DevDebugPanel.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   └── LoadingSpinner.jsx
│   ├── services/                  # Frontend services
│   │   ├── api/                   # API client services
│   │   │   ├── index.js
│   │   │   ├── endpoints.js
│   │   │   └── auth.js
│   │   ├── web3/                  # Blockchain integration
│   │   │   ├── index.js
│   │   │   ├── contracts.js
│   │   │   └── utils.js
│   │   ├── storage/               # Storage management
│   │   │   └── index.js
│   │   ├── hybridStorage.js       # Local + IPFS storage
│   │   └── initialize.js          # Service initialization
│   ├── contexts/                  # React Context providers
│   │   └── WalletProvider.jsx     # Web3 wallet context
│   ├── config/                    # Frontend configuration
│   │   └── api.json               # API endpoints config
│   ├── styles/                    # Stylesheets
│   │   └── main.css               # Global styles
│   └── utils/                     # Utility functions
│       └── validation.js          # Form/input validation
│
├── 📁 server/                     # Express.js Backend
│   ├── server.js                  # Main backend server (ONLY FILE NEEDED)
│   ├── package.json               # Backend dependencies
│   ├── package-lock.json          # Locked versions
│   ├── .env.example               # Server env template
│   ├── routes/                    # API routes
│   │   ├── officers.js            # Officer management routes
│   │   ├── firs.js                # FIR management routes
│   │   └── fir-files.js           # File upload routes
│   ├── models/                    # MongoDB schemas
│   │   ├── Officer.js             # Officer model
│   │   └── FIR.js                 # FIR model
│   ├── middlewares/               # Express middlewares
│   │   ├── auth.js                # JWT authentication
│   │   ├── security.js            # Security headers
│   │   ├── validation.js          # Input validation
│   │   └── errorHandler.js        # Error handling
│   ├── services/                  # Backend services
│   │   └── pinataService.js       # IPFS/Pinata integration
│   ├── controllers/               # Business logic
│   └── validation/                # Validation schemas
│
├── 📁 contracts/                  # Smart Contracts (Solidity)
│   ├── AccessControl.sol          # Role-based access control
│   ├── CitizenManagement.sol      # Citizen registry
│   ├── OfficerManagement.sol      # Officer registry
│   ├── FIRSystem.sol              # Core FIR logic (inherits others)
│   └── artifacts/                 # Compiled contract outputs
│       ├── FIRSystem.json
│       ├── FIRSystem_metadata.json
│       ├── CitizenManagement.json
│       ├── CitizenManagement_metadata.json
│       ├── OfficerManagement.json
│       ├── OfficerManagement_metadata.json
│       ├── AccessControl.json
│       └── AccessControl_metadata.json
│
├── 📁 scripts/                    # Deployment & Utility Scripts
│   ├── deploy.js                  # Smart contract deployment (180 lines)
│   └── verify-deployment.js       # Health check verification (120 lines)
│
├── 📁 public/                     # Static assets
│   └── favicon.svg                # Site favicon
│
├── 📁 config/                     # Configuration (now empty - legacy files removed)
│   └── (orphaned files deleted)
│
├── 📁 docs/                       # 📍 ORGANIZED DOCUMENTATION
│   ├── INDEX.md                   # Documentation index
│   ├── deployment/                # Deployment guides
│   │   ├── QUICK_DEPLOY.md               # 3-step 1-hour deployment
│   │   ├── COMPLETE_DEPLOYMENT_GUIDE.md  # Full detailed guide
│   │   ├── SMART_CONTRACT_DEPLOYMENT.md  # Contract deployment
│   │   └── DEPLOYMENT_CHECKLIST.md       # Pre/post checks
│   ├── architecture/              # System design
│   │   └── ARCHITECTURE_GUIDE.md         # Complete system design
│   └── guides/                    # How-to guides
│       ├── FEATURE_CHECKLIST.md          # 100+ features verified
│       ├── QUICK_START_TESTING.md        # 15-minute test
│       ├── TESTING_AND_DEPLOYMENT.md     # 6 testing phases
│       ├── REGISTRATION_GUIDE.md         # User registration
│       └── DEMO_STATUS.md                # Demo status
│
├── 📁 .github/                    # GitHub configuration
│   └── workflows/                 # GitHub Actions (for future CI/CD)
│
├── 📁 node_modules/               # Frontend dependencies (gitignored)
└── index.html                     # HTML entry point

```

---

## 📊 File Count & Organization

| Folder | Purpose | Files | Status |
|--------|---------|-------|--------|
| `src/` | React Frontend | 20+ | ✅ Complete |
| `server/` | Express Backend | 10+ | ✅ Complete |
| `contracts/` | Smart Contracts | 4 + artifacts | ✅ Complete |
| `docs/` | Documentation | 13 | ✅ Organized |
| `scripts/` | Automation | 2 | ✅ Complete |
| `config/` | Configuration | 0 (cleaned) | ✅ Organized |
| `.github/` | CI/CD Ready | 1 | ✅ Ready |

---

## 🎯 Key Features of This Structure

### ✅ Clear Separation of Concerns
- **src/** = Frontend only
- **server/** = Backend only
- **contracts/** = Blockchain only
- **docs/** = All documentation

### ✅ Easy to Navigate
- Documentation organized by topic
- Clear folder purposes
- Logical file groupings

### ✅ Production Ready
- Minimal unnecessary files
- Proper configuration management
- Clean, organized codebase

### ✅ Git Friendly
- `.gitignore` prevents tracking of build artifacts
- `node_modules/` excluded
- Clean history possible

### ✅ Deployment Ready
- Scripts folder for automation
- `.github/` ready for CI/CD
- Config files at root level

---

## 🚀 Common Operations

### Finding Files

**Frontend components?**
```
src/components/
```

**API endpoints?**
```
server/routes/
```

**Smart contracts?**
```
contracts/
```

**Deployment guide?**
```
docs/deployment/QUICK_DEPLOY.md
```

**Architecture details?**
```
docs/architecture/ARCHITECTURE_GUIDE.md
```

### Adding New Files

**New React component?**
```
src/components/YourComponent.jsx
```

**New API route?**
```
server/routes/yourroute.js
```

**New documentation?**
```
docs/guides/your-guide.md
```

---

## 📋 Quick Reference

| Need | Location |
|------|----------|
| Main README | `/README.md` |
| Start Guide | `/00_START_HERE.md` |
| Deploy Info | `/docs/deployment/` |
| Architecture | `/docs/architecture/ARCHITECTURE_GUIDE.md` |
| Testing | `/docs/guides/TESTING_AND_DEPLOYMENT.md` |
| Components | `/src/components/` |
| API Routes | `/server/routes/` |
| Smart Contracts | `/contracts/` |

---

## ✨ What Makes This Structure Great

1. **Scalable** - Easy to add new components/routes/contracts
2. **Maintainable** - Clear organization, easy to find things
3. **Professional** - Follows industry best practices
4. **Documented** - Comprehensive guides in proper locations
5. **Clean** - No dead code or duplicate files
6. **Secure** - Sensitive files properly handled
7. **Ready** - Can deploy immediately

---

## 🔄 Last Updated

**Date:** December 12, 2025  
**Status:** ✅ Fully Organized & Clean  
**Files:** 65+ functional files  
**Storage:** Optimized (~50 MB)

---

## 📞 Navigation

- **Want to deploy?** → Read `/README.md` then `/docs/deployment/QUICK_DEPLOY.md`
- **Want to code?** → Check `/docs/architecture/ARCHITECTURE_GUIDE.md`
- **Want to test?** → Follow `/docs/guides/QUICK_START_TESTING.md`
- **Want to understand?** → See `/00_START_HERE.md`
