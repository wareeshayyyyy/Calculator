# 🧮 Calculator App

A modern, responsive calculator application built with React and Node.js.

## Features

- ✅ Basic arithmetic operations (addition, subtraction, multiplication, division)
- ✅ Clean, modern interface
- ✅ Responsive design
- ✅ Real-time calculations
- ✅ Professional UI/UX

## Tech Stack

- **Frontend**: React, CSS3, HTML5
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Deployment**: Vercel-ready

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/wareeshayyyyy/Calculator.git
   cd Calculator
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

3. **Environment Setup**
   ```bash
   # Create environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Start the application**
   ```bash
   # Development mode (both client and server)
   npm run dev
   
   # Or start individually:
   # Server: cd server && npm start
   # Client: cd client && npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the calculator for basic arithmetic operations
3. Enjoy the clean, responsive interface!

## Project Structure

```
Calculator/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
└── package.json           # Root package.json
```

## Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow the prompts

### Local Production Build
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Wareesha** - [GitHub](https://github.com/wareeshayyyyy)

---

⭐ **Star this repository if you found it helpful!**
