import { useState, useMemo } from 'react';

export default function useTablePagination(data, searchKeys = [], defaultRowsPerPage = 10) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

    // Reset to page 1 when search query changes
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleRowsPerPageChange = (rows) => {
        setRowsPerPage(rows);
        setCurrentPage(1);
    };

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        
        const lowerQuery = searchQuery.toLowerCase();
        
        return data.filter(item => {
            return searchKeys.some(key => {
                // Handle nested keys like "supplier.name"
                const value = key.split('.').reduce((obj, k) => (obj || {})[k], item);
                if (value == null) return false;
                return String(value).toLowerCase().includes(lowerQuery);
            });
        });
    }, [data, searchQuery, searchKeys]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(currentPage, totalPages);

    const currentData = useMemo(() => {
        const start = (validCurrentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, validCurrentPage, rowsPerPage]);

    return {
        currentData,
        searchQuery,
        setSearchQuery: handleSearchChange,
        currentPage: validCurrentPage,
        setCurrentPage,
        totalPages,
        rowsPerPage,
        setRowsPerPage: handleRowsPerPageChange,
        totalElements: filteredData.length
    };
}
