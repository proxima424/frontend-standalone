const express = require('express');
const cors = require('cors');
const { createPublicClient, http } = require('viem');
const { watchContractEvent } = require('viem/contracts');
const { connectDB } = require('./db');
const Token = require('./models/Token');
const config = require('./config');

const app = express();
const port = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize viem client
const client = createPublicClient({
    transport: http(config.RPC_URL)
});

// Clanker.sol stuff
const clankerAddress = config.CLANKER_CONTRACT_ADDRESS;
const clankerABI = [
    {
        type: 'event',
        name: 'TokenCreated',
        inputs: [
            { type: 'address', name: 'tokenAddress', indexed: true },
            { type: 'uint256', name: 'positionId' },
            { type: 'address', name: 'deployer' },
            { type: 'uint256', name: 'fid' },
            { type: 'string', name: 'name' },
            { type: 'string', name: 'symbol' },
            { type: 'uint256', name: 'supply' },
            { type: 'address', name: 'lockerAddress' },
            { type: 'string', name: 'castHash' }
        ]
    }
];

// Example ABI for the token contract
const tokenABI = [
    {
        type: 'function',
        name: 'image',
        inputs: [],
        outputs: [{ type: 'string' }],
        stateMutability: 'view'
    }
];

// Start listening to events
async function startEventListener() {
    console.log('Starting event listener...');
    
    // Get the latest block number
    const latestBlock = await client.getBlockNumber();
    console.log('Latest block:', latestBlock);
    
    // Watch for TokenCreated events
    watchContractEvent({
        client,
        address: clankerAddress,
        abi: clankerABI,
        eventName: 'TokenCreated',
        onEvent: async (event) => {
            const { tokenAddress, deployer, name, symbol, supply } = event.args;
            try {
                // Fetch the image URL
                // @TODO : Add fallback error handling
                const imageUrl = await client.readContract({
                    address: tokenAddress,
                    abi: tokenABI,
                    functionName: 'image'
                });

                // Store the token data in the database
                await Token.create({
                    tokenAddress,
                    deployer,
                    name,
                    symbol,
                    supply,
                    image_url: imageUrl
                });
                console.log('New token created:', tokenAddress);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log('Token already indexed:', tokenAddress);
                } else {
                    console.error('Error saving token:', error);
                }
            }
        }
    });
}

// API Endpoints
app.get('/api/tokens', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: tokens } = await Token.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            tokens,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalTokens: count
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize database and start server
const init = async () => {
    try {
        // Connect to PostgreSQL
        await connectDB();
        
        // Start the server
        app.listen(port, () => {
            console.log(`Indexer server running on port ${port}`);
            startEventListener().catch(console.error);
        });
    } catch (error) {
        console.error('Failed to initialize:', error);
        process.exit(1);
    }
};

init();
