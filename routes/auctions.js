const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all auctions
router.get('/', (req, res) => {
  const status = req.query.status || 'open';
  
  db.all(
    `SELECT a.*, u.username as seller_name 
     FROM auctions a 
     JOIN users u ON a.seller_id = u.id 
     WHERE a.status = ? 
     ORDER BY a.created_at DESC`,
    [status],
    (err, auctions) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch auctions' });
      }
      res.json(auctions);
    }
  );
});

// Get a specific auction
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT a.*, u.username as seller_name 
     FROM auctions a 
     JOIN users u ON a.seller_id = u.id 
     WHERE a.id = ?`,
    [id],
    (err, auction) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch auction' });
      }
      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }
      
      // Get bids for this auction
      db.all(
        `SELECT b.*, u.username as bidder_name 
         FROM bids b 
         JOIN users u ON b.bidder_id = u.id 
         WHERE b.auction_id = ? 
         ORDER BY b.amount DESC`,
        [id],
        (err, bids) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch bids' });
          }
          res.json({ ...auction, bids });
        }
      );
    }
  );
});

// Create a new auction (requires authentication)
router.post('/', authMiddleware, (req, res) => {
  const { title, description, starting_price, end_time } = req.body;
  const seller_id = req.user.id;

  if (!title || !description || !starting_price || !end_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    `INSERT INTO auctions (title, description, starting_price, current_price, seller_id, end_time) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, starting_price, starting_price, seller_id, end_time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create auction' });
      }
      res.status(201).json({ 
        message: 'Auction created successfully',
        auctionId: this.lastID 
      });
    }
  );
});

// Place a bid (requires authentication)
router.post('/:id/bid', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const bidder_id = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid bid amount is required' });
  }

  // Check if auction exists and is open
  db.get('SELECT * FROM auctions WHERE id = ?', [id], (err, auction) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (auction.status !== 'open') {
      return res.status(400).json({ error: 'Auction is closed' });
    }
    if (auction.seller_id === bidder_id) {
      return res.status(400).json({ error: 'Cannot bid on your own auction' });
    }
    if (amount <= auction.current_price) {
      return res.status(400).json({ 
        error: `Bid must be higher than current price of ${auction.current_price}` 
      });
    }

    // Place the bid
    db.run(
      'INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)',
      [id, bidder_id, amount],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to place bid' });
        }

        // Update auction current price
        db.run(
          'UPDATE auctions SET current_price = ? WHERE id = ?',
          [amount, id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update auction' });
            }
            res.status(201).json({ 
              message: 'Bid placed successfully',
              bidId: this.lastID,
              amount 
            });
          }
        );
      }
    );
  });
});

// Close an auction (requires authentication, only seller can close)
router.patch('/:id/close', authMiddleware, (req, res) => {
  const { id } = req.params;
  const seller_id = req.user.id;

  db.get('SELECT * FROM auctions WHERE id = ?', [id], (err, auction) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (auction.seller_id !== seller_id) {
      return res.status(403).json({ error: 'Only the seller can close the auction' });
    }
    if (auction.status === 'closed') {
      return res.status(400).json({ error: 'Auction is already closed' });
    }

    db.run(
      'UPDATE auctions SET status = ? WHERE id = ?',
      ['closed', id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to close auction' });
        }
        res.json({ message: 'Auction closed successfully' });
      }
    );
  });
});

module.exports = router;
