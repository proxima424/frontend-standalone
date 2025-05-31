import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useMarketAIReasoning = () => {
    const [marketAIData, setMarketAIData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'YES', 'NO'
    
    const ITEMS_PER_PAGE = 6;

    const fetchMarketAIData = async (page = 1, filter = 'ALL') => {
        try {
            setLoading(true);
            setError(null);
            
            // Calculate offset for pagination
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            // Build query with optional filter
            let query = supabase
                .from('market_ai_reasoning')
                .select('*', { count: 'exact' })
                .order('settlement_time', { ascending: false });
            
            // Apply filter if not 'ALL'
            if (filter !== 'ALL') {
                query = query.eq('answer', filter);
            }
            
            // Apply pagination
            query = query.range(from, to);

            const { data, error: supabaseError, count } = await query;

            if (supabaseError) {
                console.error('Error fetching market_ai_reasoning data:', supabaseError);
                setError(supabaseError.message);
                return null;
            }

            console.log('Fetched market_ai_reasoning data:', data);
            setMarketAIData(data);
            setTotalCount(count || 0);
            setCurrentPage(page);
            setSelectedFilter(filter);
            return data;
        } catch (err) {
            console.error('Error in fetchMarketAIData:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const changePage = (newPage) => {
        fetchMarketAIData(newPage, selectedFilter);
    };

    const changeFilter = (newFilter) => {
        fetchMarketAIData(1, newFilter); // Reset to page 1 when filter changes
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return {
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
    };
}; 