# Performance Guidelines

## Component Performance

### 1. Memoization

```typescript
// Bad - Recreating objects on every render
function BadComponent() {
  const styles = { color: 'red' };  // New object every render
  const handleClick = () => {
    console.log('clicked');
  };  // New function every render
  
  return <Button style={styles} onClick={handleClick}>Click me</Button>;
}

// Good - Memoized objects and callbacks
function GoodComponent() {
  const styles = useMemo(() => ({ color: 'red' }), []);
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Button style={styles} onClick={handleClick}>Click me</Button>;
}
```

### 2. List Rendering

```typescript
// Bad - No key or index as key
function BadList({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.name}</li>  // Don't use index as key
      ))}
    </ul>
  );
}

// Good - Stable unique key
function GoodList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 3. Data Fetching

```typescript
// Bad - Fetch on every render
function BadComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []); // Still not ideal
  
  return <div>{data?.name}</div>;
}

// Good - Use React Query with proper caching
function GoodComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: () => fetch('/api/data').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
  
  if (isLoading) return <LoadingState />;
  return <div>{data?.name}</div>;
}
```

## Bundle Size Optimization

### 1. Code Splitting

```typescript
// Bad - Import entire library
import { everything } from 'huge-library';

// Good - Import only what's needed
import { specificFunction } from 'huge-library/specificFunction';

// Better - Dynamic import for route splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingState />
});
```

### 2. Tree Shaking

```typescript
// Bad - Default export
export default {
  function1,
  function2,
  function3
};

// Good - Named exports
export { function1, function2, function3 };
```

## Image Optimization

```typescript
// Bad - Direct img tag
function BadImage() {
  return <img src="/large-image.jpg" />;
}

// Good - Next.js Image component
function GoodImage() {
  return (
    <Image
      src="/large-image.jpg"
      alt="Description"
      width={800}
      height={600}
      placeholder="blur"
      loading="lazy"
    />
  );
}
```

## State Management

### 1. Local vs. Global State

```typescript
// Bad - Global state for everything
const globalStore = create((set) => ({
  userName: '',
  theme: 'light',
  sidebarOpen: false,  // This should be local
}));

// Good - Local state for UI, global for shared data
function GoodComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userName, theme } = useGlobalStore();
  
  return (
    <div data-theme={theme}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main>{userName}</main>
    </div>
  );
}
```

### 2. Query Invalidation

```typescript
// Bad - Manual refetch
function BadComponent() {
  const queryClient = useQueryClient();
  
  const handleUpdate = async () => {
    await updateData();
    queryClient.invalidateQueries({ queryKey: ['data'] });
  };
}

// Good - Optimistic updates
function GoodComponent() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateData,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['data'] });
      const previousData = queryClient.getQueryData(['data']);
      queryClient.setQueryData(['data'], newData);
      return { previousData };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['data'], context.previousData);
    }
  });
}
```

## Performance Monitoring

```typescript
// Add performance marks
export function TrackedComponent() {
  useEffect(() => {
    performance.mark('component-mounted');
    
    return () => {
      performance.measure(
        'component-lifecycle',
        'component-mounted'
      );
    };
  }, []);
  
  return <div>Tracked Component</div>;
}

// Monitor React renders
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```
