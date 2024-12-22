const INDEXER_URL = 'http://localhost:3001/api';

export const indexerService = {
    // Fetch all events
    async getAllEvents() {
        try {
            const response = await fetch(`${INDEXER_URL}/events`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Fetch specific event by marketId
    async getEventByMarketId(marketId) {
        try {
            const response = await fetch(`${INDEXER_URL}/events/${marketId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    }
};
