# AdminDataPanel Component

A reusable component for displaying and managing tabular data in admin interfaces with integrated search, refresh, and pagination capabilities.

## Features

- Consistent card layout with title and description
- Integrated search bar with debounce support
- Refresh button with loading indicator
- Data table with support for loading states and empty messages
- Support for pagination (optional)
- Support for custom action buttons in the header

## Usage

```jsx
import AdminDataPanel from '@/components/AdminDataPanel';

<AdminDataPanel
  title="Users"
  description="Manage all users in the system."
  columns={columnsArray}
  data={usersArray}
  loading={loading}
  isStale={isStale}
  searchValue={searchQuery}
  onSearchChange={handleInputChange}
  onRefresh={handleRefresh}
  refreshing={refreshing}
  searchPlaceholder="Search by name or email..."
  emptyMessage="No users found"
  pagination={{
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    onPageChange: handlePageChange,
  }}
  actions={<Button>Custom Action</Button>}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Panel title |
| `description` | string | - | Panel description |
| `columns` | array | `[]` | Table column definitions |
| `data` | array | `[]` | Data for the table |
| `loading` | boolean | `false` | Whether data is loading |
| `isStale` | boolean | `false` | Whether data is stale |
| `searchValue` | string | `""` | Current search value |
| `onSearchChange` | function | - | Search input change handler |
| `onRefresh` | function | - | Refresh button click handler |
| `refreshing` | boolean | `false` | Whether refresh operation is in progress |
| `searchPlaceholder` | string | `"Search..."` | Placeholder text for search input |
| `emptyMessage` | string | `"No items found"` | Message to display when data is empty |
| `showRefreshButton` | boolean | `true` | Whether to show refresh button |
| `showSearchBar` | boolean | `true` | Whether to show search bar |
| `actions` | React.ReactNode | `null` | Additional action buttons to display in header |
| `pagination` | object | `null` | Pagination configuration |

## Column Definition

Columns should be defined as an array of objects with the following properties:

```jsx
const columns = [
  {
    header: "Name", // Column header text
    accessor: "name", // Property name in data objects
    className: "text-left", // Optional CSS class for header
    cellClassName: "font-medium", // Optional CSS class for cells
    cell: (item) => <span>{item.name}</span>, // Optional custom cell render function
  },
]
```

The `cell` property is a function that receives the current data item and returns a React element. This allows for custom formatting, badge display, or action buttons in table cells.

## Pagination Configuration

If pagination is needed, provide an object with the following properties:

```jsx
pagination={{
  currentPage: 1, // Current active page (1-based)
  totalPages: 10, // Total number of pages
  onPageChange: (newPage) => {}, // Handler function when page changes
}}
```

## Dependencies

This component relies on the following components:

- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `SearchBar` from `../SearchBar`
- `DataTable` from `../DataTable`
- `EnhancedPagination` from `../EnhancedPagination`
- `RefreshCw` icon from `lucide-react`

## Example

```jsx
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  
  const { 
    inputValue: searchQuery, 
    debouncedValue: debouncedSearchQuery,
    isStale,
    handleInputChange 
  } = useSearch("");
  
  const fetchUsers = async () => {
    setLoading(true);
    // API call logic
    setLoading(false);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const columns = [
    {
      header: "Name",
      accessor: "name",
      cell: (user) => <span className="font-medium">{user.name}</span>,
    },
    {
      header: "Email",
      accessor: "email",
    },
    // More columns...
  ];
  
  return (
    <AdminDataPanel
      title="Users"
      description="Manage all users in the system."
      columns={columns}
      data={users}
      loading={loading}
      isStale={isStale}
      searchValue={searchQuery}
      onSearchChange={handleInputChange}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      searchPlaceholder="Search by name or email..."
      emptyMessage="No users found"
      pagination={{
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: handlePageChange,
      }}
    />
  );
};
```
