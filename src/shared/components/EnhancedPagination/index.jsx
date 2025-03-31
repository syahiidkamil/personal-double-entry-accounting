import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Enhanced pagination component with support for first/last page and ellipsis
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler
 * @param {string} props.className - Additional CSS classes
 */
const EnhancedPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  // Don't render if there are no pages or only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous page button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          />
        </PaginationItem>

        {/* First page */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(1)}>
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Ellipsis if needed */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationLink disabled>...</PaginationLink>
          </PaginationItem>
        )}

        {/* Previous page */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(currentPage - 1)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Current page */}
        <PaginationItem>
          <PaginationLink isActive>{currentPage}</PaginationLink>
        </PaginationItem>

        {/* Next page */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(currentPage + 1)}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Ellipsis if needed */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationLink disabled>...</PaginationLink>
          </PaginationItem>
        )}

        {/* Last page */}
        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Next page button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default EnhancedPagination;