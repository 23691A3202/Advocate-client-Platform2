# Advocate-Client Case Request Platform

A professional web application for managing legal case requests between advocates and clients.

## Features

### Authentication
- Email and password signup/login
- Email OTP verification during signup
- Role-based access (Client/Advocate)

### Client Features
- Client dashboard
- Create case requests with categories
- View submitted cases with status tracking
- View advocate details and fees for accepted cases

### Advocate Features
- Advocate dashboard
- View pending case requests
- Accept or reject cases
- Set fees when accepting cases

### Case Categories
- Theft Case
- Property / Asset Issue
- Civil Case
- Criminal Case
- Family Dispute

## Technology Stack

- **Frontend**: React with Vite
- **Styling**: CSS3 with responsive design
- **Data Storage**: localStorage (mock backend)
- **Deployment**: Netlify-ready

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd advocate-client-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
```

## Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Netlify Deployment

#### Option 1: Direct Deploy
1. Run `npm run build`
2. Drag and drop the `dist` folder to Netlify

#### Option 2: GitHub Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on git push

## Usage

### For Clients
1. Register with email and verify OTP
2. Login to access client dashboard
3. Create new case requests
4. Track case status and view advocate details

### For Advocates
1. Register as advocate and verify OTP
2. Login to access advocate dashboard
3. Review pending cases
4. Accept cases with fee or reject them

### Demo Credentials
Since this uses localStorage, you'll need to register new users. The OTP will be displayed in an alert for demo purposes.

## Project Structure

```
src/
├── components/
│   ├── Auth.jsx              # Login, Register, OTP components
│   ├── ClientDashboard.jsx   # Client interface
│   └── AdvocateDashboard.jsx # Advocate interface
├── services/
│   ├── authService.js        # Authentication logic
│   └── caseService.js        # Case management logic
├── App.jsx                   # Main application component
├── App.css                   # Styles
└── main.jsx                  # Entry point
```

## Environment Variables

No environment variables required for this demo version as it uses localStorage.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.