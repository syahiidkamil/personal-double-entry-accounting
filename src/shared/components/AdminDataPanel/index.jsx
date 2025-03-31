import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchBar from "../SearchBar";
import DataTable from "../DataTable";
import EnhancedPagination from "../EnhancedPagination";

/**
 * AdminDataPanel - A comprehensive data management panel combining search, data table, and pagination
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Panel title
 * @param {string} props.description - Panel description
 * @param {Array} props.columns - Table column definitions
 * @param {Array} props.data - Data for the table
 * @param {boolean} props.loading - Whether data is loading
 * @param {boolean} props.isStale - Whether data is stale
 * @param {string} props.searchValue - Current search value
 * @param {Function} props.onSearchChange - Search input change handler
 * @param {Function} props.onRefresh - Refresh button click handler
 * @param {boolean} props.refreshing - Whether refresh operation is in progress
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.emptyMessage - Message to display when data is empty
 * @param {boolean} props.showRefreshButton - Whether to show refresh button
 * @param {boolean} props.showSearchBar - Whether to show search bar
 * @param {React.ReactNode} props.actions - Additional action buttons to display in header
 * @param {Object} props.pagination - Pagination configuration
 * @param {number} props.pagination.currentPage - Current page
 * @param {number} props.pagination.totalPages - Total pages
 * @param {Function} props.pagination.onPageChange - Page change handler
 */
const AdminDataPanel = ({
  title,
  description,
  columns = [],
  data = [],
  loading = false,
  isStale = false,
  searchValue = "",
  onSearchChange,
  onRefresh,
  refreshing = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  showRefreshButton = true,
  showSearchBar = true,
  actions = null,
  pagination = null,
}) => {
  const handleSearch = (e) => {
    e.preventDefault();
    // If a custom handler is provided, use it
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            {showRefreshButton && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search bar */}
        {showSearchBar && (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={handleSearch}
            placeholder={searchPlaceholder}
            showButton={false}
            className="mb-4"
          />
        )}

        {/* Data table */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            isStale={isStale}
            emptyMessage={emptyMessage}
            staleMessage="spinner"
          />
        </div>

        {/* Pagination if provided */}
        {pagination && !loading && data.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <EnhancedPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDataPanel;