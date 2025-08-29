import { useState } from 'react';
import { type Request } from './types.ts';

interface FilterParams {
  viewed: boolean;
  notViewed: boolean;
  statuses: string[];
  dateFrom: string;
  dateTo: string;
}

export function useRequestsFilter(initialRequests: Request[]) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortValue, setSortValue] = useState<string>('');
  const [filters, setFilters] = useState<FilterParams>({
    viewed: false,
    notViewed: false,
    statuses: [],
    dateFrom: '',
    dateTo: '',
  });

  const parseDate = (dateStr: string): Date | null => {
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    }
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const filteredAndSortedRequests = initialRequests
    .filter((request) => {
      if (
        searchValue &&
        !request.email.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false;
      }
      if (filters.viewed && !filters.notViewed && !request.is_viewed) {
        return false;
      }
      if (filters.notViewed && !filters.viewed && request.is_viewed) {
        return false;
      }
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(request.status)
      ) {
        return false;
      }
      const requestDate = parseDate(request.date);
      if (!requestDate) return false;
      if (filters.dateFrom) {
        const fromDate = parseDate(filters.dateFrom);
        if (!fromDate || requestDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = parseDate(filters.dateTo);
        if (!toDate || requestDate > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (!dateA || !dateB) return 0;

      if (sortValue === 'newest') {
        return dateB.getTime() - dateA.getTime();
      } else if (sortValue === 'oldest') {
        return dateA.getTime() - dateB.getTime();
      } else if (sortValue === 'status') {
        return a.status.localeCompare(b.status);
      }
      if (a.is_viewed !== b.is_viewed) {
        return a.is_viewed ? 1 : -1;
      }
      return 0;
    });

  return {
    filteredAndSortedRequests,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
    filters,
    setFilters,
  };
}