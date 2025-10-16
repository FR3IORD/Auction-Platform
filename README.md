# Auction-Platform

A full-featured online auction platform built with Node.js, Express, and SQLite. Users can register, create auctions, place bids, and manage their listings through an intuitive web interface.

## Features

- **User Authentication**: Register and login with secure JWT-based authentication
- **Auction Management**: Create, view, and close auctions
- **Real-time Bidding**: Place bids on open auctions
- **Bid History**: View complete bid history for each auction
- **Status Tracking**: Filter auctions by status (open/closed)
- **Responsive UI**: Clean, modern interface that works on all devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Installation

1. Clone the repository:
```bash
git clone https://github.com/FR3IORD/Auction-Platform.git
cd Auction-Platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are provided):
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Auctions
- `GET /api/auctions` - Get all auctions (query param: status=open/closed)
- `GET /api/auctions/:id` - Get auction details with bid history
- `POST /api/auctions` - Create a new auction (requires authentication)
- `POST /api/auctions/:id/bid` - Place a bid (requires authentication)
- `PATCH /api/auctions/:id/close` - Close an auction (seller only)

### Health Check
- `GET /api/health` - Check API status

## Usage

1. **Register/Login**: Create an account or login to access full features
2. **Browse Auctions**: View open or closed auctions
3. **Create Auction**: Click "Create Auction" to list a new item
4. **Place Bids**: Click on any auction to view details and place bids
5. **Manage Auctions**: Sellers can close their own auctions

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Registration timestamp

### Auctions Table
- `id` - Primary key
- `title` - Auction title
- `description` - Detailed description
- `starting_price` - Initial price
- `current_price` - Current highest bid
- `seller_id` - Foreign key to users
- `status` - open/closed
- `end_time` - Auction end date/time
- `created_at` - Creation timestamp

### Bids Table
- `id` - Primary key
- `auction_id` - Foreign key to auctions
- `bidder_id` - Foreign key to users
- `amount` - Bid amount
- `created_at` - Bid timestamp

## License

MIT
