import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicClient, useBlockNumber } from 'wagmi';
import { CONTRACT_ABIS } from '../contracts/config';
import './UserMarkets.css';

const PNP_FACTORY_ADDRESS = '0xD70E46d039bcD87e5bFce37C38727D7020C1998D';

const UserMarkets = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber();
  const [conditionIds, setConditionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!blockNumber) return;

      try {
        setIsLoading(true);
        const fromBlock = blockNumber - 50000n;
        console.log('Creating filter from block:', fromBlock.toString());

        // Create event filter
        const filter = await publicClient.createContractEventFilter({
          address: PNP_FACTORY_ADDRESS,
          abi: CONTRACT_ABIS.PNP_FACTORY.abi,
          eventName: 'PnpTwitterMarketCreated',
          fromBlock: fromBlock,
          args: {
            marketCreator: address
          }
        });

        // Get logs using the filter
        const logs = await publicClient.getFilterLogs({ filter });
        
        // Extract conditionIds
        const ids = logs.map(log => log.args.conditionId);
        setConditionIds(ids);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, [address, blockNumber, publicClient]);

  const handleMarketClick = (conditionId) => {
    navigate(`/twitter_markets/${conditionId}`);
  };

  return (
    <div className="user-markets-container">
      <div className="glass-header">
        <h1>Markets Created by</h1>
        <div className="address-display">{address}</div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Scanning the blockchain...</p>
        </div>
      ) : conditionIds.length === 0 ? (
        <div className="no-markets-container">
          <p>No markets found for this address</p>
        </div>
      ) : (
        <div className="markets-list">
          {conditionIds.map((id, index) => (
            <div 
              key={id} 
              className="market-item"
              onClick={() => handleMarketClick(id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleMarketClick(id)}
            >
              <span className="market-number">#{index + 1}</span>
              <span className="condition-id">{id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMarkets;
