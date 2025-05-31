import React, { useEffect } from 'react';
import { useMarketAIReasoning } from '../hooks/useMarketAIReasoning';
import styles from './MarketAIReasoning.module.css'; // Import CSS Module
import { MessageSquareText, BrainCircuit, ChevronLeft, ChevronRight, Filter } from 'lucide-react'; // Icons

function MarketAIReasoningPage() {
  const { 
    marketAIData, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalCount, 
    selectedFilter, 
    fetchMarketAIData, 
    changePage, 
    changeFilter 
  } = useMarketAIReasoning();

  useEffect(() => {
    fetchMarketAIData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch data on component mount

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h2 className={styles.loadingText}>Loading Settled Markets...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorText}>Error Fetching Data</h2>
          <p className={styles.errorDetails}>{error}</p>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.paginationContainer}>
        <button 
          className={`${styles.paginationButton} ${styles.paginationArrow}`}
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} />
        </button>

        {pageNumbers.map(pageNumber => (
          <button
            key={pageNumber}
            className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.active : ''}`}
            onClick={() => changePage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        <button 
          className={`${styles.paginationButton} ${styles.paginationArrow}`}
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settled Markets Dashboard</h1>
        <p className={styles.subtitle}>
          Insights and reasoning behind concluded prediction markets.
        </p>
      </header>

      {/* Filter Buttons */}
      <div className={styles.filterContainer}>
        <div className={styles.filterHeader}>
          <Filter size={20} className={styles.filterIcon} />
          <span className={styles.filterLabel}>Filter by Answer:</span>
        </div>
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterButton} ${selectedFilter === 'ALL' ? styles.activeFilter : ''}`}
            onClick={() => changeFilter('ALL')}
          >
            All Markets
          </button>
          <button 
            className={`${styles.filterButton} ${styles.yesButton} ${selectedFilter === 'YES' ? styles.activeFilter : ''}`}
            onClick={() => changeFilter('YES')}
          >
            YES Markets
          </button>
          <button 
            className={`${styles.filterButton} ${styles.noButton} ${selectedFilter === 'NO' ? styles.activeFilter : ''}`}
            onClick={() => changeFilter('NO')}
          >
            NO Markets
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <p>
          Showing {marketAIData?.length || 0} of {totalCount} settled markets
          {selectedFilter !== 'ALL' && ` (${selectedFilter} answers)`}
        </p>
        {totalPages > 1 && (
          <p>Page {currentPage} of {totalPages}</p>
        )}
      </div>

      {marketAIData && marketAIData.length > 0 ? (
        <>
          <div className={styles.settledMarketsGrid}>
            {marketAIData.map((item, index) => (
              <div 
                key={item.id || index} 
                className={styles.marketCard}
                style={{ animationDelay: `${index * 0.1}s` }} // Staggered animation
              >
                <div className={styles.marketHeader}>
                  <div className={styles.marketQuestion}>
                    <MessageSquareText size={22} style={{ marginRight: '10px', color: '#ff69b4' }} />
                    {item.question}
                  </div>
                  <div className={`${styles.answerBadge} ${item.answer === 'YES' ? styles.yesBadge : styles.noBadge}`}>
                    {item.answer}
                  </div>
                </div>
                <div className={styles.reasoningSection}>
                  <h4 className={styles.reasoningTitle}>
                    <BrainCircuit size={18} style={{ color: '#ff69b4' }} />
                    AI Reasoning
                  </h4>
                  <div className={styles.marketReasoning}>
                    {item.reasoning}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      ) : (
        <div className={styles.noDataMessage}>
          No settled market data available for the selected filter.
        </div>
      )}
    </div>
  );
}

export default MarketAIReasoningPage; 