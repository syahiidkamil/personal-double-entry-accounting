import React, { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * A reusable data table component with loading, empty, and stale states
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data rows
 * @param {boolean} props.loading - Whether the data is loading
 * @param {boolean} props.isStale - Whether the data is stale
 * @param {string} props.emptyMessage - Message to display when data is empty
 * @param {string} props.loadingMessage - Message to display when loading
 * @param {string} props.staleMessage - Message to display when data is stale or "spinner" for animated spinner
 * @param {Function} props.rowRenderer - Custom row renderer function
 */
const DataTable = memo(function DataTable({
  columns = [],
  data = [],
  loading = false,
  isStale = false,
  emptyMessage = "No items found",
  loadingMessage = "Loading...",
  staleMessage = "Updating results...",
  rowRenderer,
  className = "",
}) {
  // Render the table with loading, empty, and stale states
  const renderTable = () => {
    // If loading and not stale, show loading spinner
    if (loading && !isStale) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">{loadingMessage}</span>
        </div>
      );
    }

    return (
      <div
        style={{
          opacity: isStale ? 0.7 : 1,
          transition: isStale ? 'opacity 0.2s 0.2s linear' : 'opacity 0s 0s linear'
        }}
      >
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // If rowRenderer is provided, use it, otherwise use default rendering
              rowRenderer ? 
                data.map((row, rowIndex) => rowRenderer(row, rowIndex, columns)) :
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.cellClassName}>
                        {column.cell ? column.cell(row) : row[column.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        {/* Show loading indicator when refreshing with stale data */}
        {isStale && loading && (
          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            {staleMessage === "spinner" ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            <span>{staleMessage === "spinner" ? "Updating results..." : staleMessage}</span>
          </div>
        )}
      </div>
    );
  };

  return renderTable();
});

export default DataTable;