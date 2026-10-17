const Auction = require('../models/Auction');
const WoolBatch = require('../models/WoolBatch');
const logger = require('../utils/logger');

// ─── Auto-transition auction statuses based on current time ──────────────────
const syncAuctionStatuses = async () => {
    const now = new Date();
    // Upcoming → Live (startTime has passed, endTime hasn't)
    await Auction.updateMany(
        { status: 'Upcoming', startTime: { $lte: now }, endTime: { $gt: now } },
        { $set: { status: 'Live' } }
    );
    // Live → Ended/Sold (endTime has passed)
    const expiredAuctions = await Auction.find({ status: 'Live', endTime: { $lte: now } });
    for (const auction of expiredAuctions) {
        if (auction.currentBidder && auction.currentBid >= (auction.reservePrice || 0)) {
            auction.status = 'Sold';
            auction.winner = auction.currentBidder;
            auction.finalPrice = auction.currentBid;
        } else {
            auction.status = 'Ended';
        }
        await auction.save();
    }
    // Upcoming → Ended (startTime AND endTime both passed — missed auction)
    await Auction.updateMany(
        { status: 'Upcoming', endTime: { $lte: now } },
        { $set: { status: 'Ended' } }
    );
};

const createAuction = async (req, res) => {
    try {
        const { batchId, title, description, startPrice, reservePrice, startTime, endTime, minBidIncrement } = req.body;
        // Support lookup by MongoDB _id OR by the human-readable batchId field
        let batch = null;
        if (batchId.match(/^[0-9a-fA-F]{24}$/)) {
            batch = await WoolBatch.findById(batchId);
        }
        if (!batch) {
            batch = await WoolBatch.findOne({ batchId: batchId });
        }
        if (!batch) {
            // Also try a case-insensitive partial match (e.g., user types "8211" and batch is "BATCH-8211...")
            batch = await WoolBatch.findOne({ batchId: { $regex: batchId, $options: 'i' } });
        }
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found. Please enter a valid Batch ID (e.g., BATCH-XXXXXXXX) from your batches list.' });
        if (batch.qualityStatus !== 'Approved') return res.status(400).json({ success: false, message: 'Only approved batches can be auctioned. Current status: ' + batch.qualityStatus });
        const auction = await Auction.create({ batch: batch._id, seller: req.user._id, title, description, startPrice, reservePrice, startTime: new Date(startTime), endTime: new Date(endTime), minBidIncrement: minBidIncrement || 100 });
        res.status(201).json({ success: true, auction });
    } catch (error) {
        logger.error('Auction creation error: ' + error.message);
        res.status(500).json({ success: false, message: 'Auction creation failed: ' + error.message });
    }
};

const getAuctions = async (req, res) => {
    try {
        await syncAuctionStatuses();
        const { status } = req.query;
        const query = status ? { status } : { status: { $in: ['Upcoming', 'Live'] } };
        const auctions = await Auction.find(query).populate('batch', 'batchId woolType weight').populate('seller', 'name').sort({ endTime: 1 });
        res.json({ success: true, auctions });
    } catch { res.status(500).json({ success: false, message: 'Failed to fetch auctions' }); }
};

const getAuctionById = async (req, res) => {
    try {
        await syncAuctionStatuses();
        const auction = await Auction.findById(req.params.id).populate('batch').populate('seller', 'name email').populate('bids.bidder', 'name').populate('currentBidder', 'name');
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        res.json({ success: true, auction });
    } catch { res.status(500).json({ success: false, message: 'Server error' }); }
};

const placeBid = async (req, res) => {
    try {
        await syncAuctionStatuses();
        const { amount } = req.body;
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        if (auction.status !== 'Live') return res.status(400).json({ success: false, message: 'Auction is not live' });
        if (auction.seller.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Seller cannot bid on own auction' });
        const minBid = (auction.currentBid || auction.startPrice) + auction.minBidIncrement;
        if (amount < minBid) return res.status(400).json({ success: false, message: 'Bid must be at least ' + minBid });
        auction.bids.push({ bidder: req.user._id, amount });
        auction.currentBid = amount;
        auction.currentBidder = req.user._id;
        await auction.save();
        // Emit real-time bid update
        const io = req.app.get('io');
        if (io) io.to('auction_' + auction._id).emit('new_bid', { auctionId: auction._id, amount, bidder: req.user.name, timestamp: new Date() });
        res.json({ success: true, auction });
    } catch (error) { res.status(500).json({ success: false, message: 'Bid placement failed' }); }
};

const endAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Not authorized' });
        if (auction.currentBidder && auction.currentBid >= (auction.reservePrice || 0)) {
            auction.status = 'Sold';
            auction.winner = auction.currentBidder;
            auction.finalPrice = auction.currentBid;
        } else {
            auction.status = 'Ended';
        }
        await auction.save();
        res.json({ success: true, auction });
    } catch { res.status(500).json({ success: false, message: 'Failed to end auction' }); }
};

module.exports = { createAuction, getAuctions, getAuctionById, placeBid, endAuction };

