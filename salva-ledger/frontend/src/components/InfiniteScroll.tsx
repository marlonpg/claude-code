import { useRef, useEffect, useCallback } from 'react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  loading?: boolean;
  threshold?: number;
}

/**
 * InfiniteScroll component for loading data on scroll
 */
function InfiniteScroll({ children, onLoadMore, loading = false, threshold = 100 }: InfiniteScrollProps) {
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (!loading && observerTargetRef.current) {
      onLoadMore();
    }
  }, [loading, onLoadMore]);

  // Intersection Observer for scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold,
      }
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }

    return () => {
      if (observerTargetRef.current) {
        observer.unobserve(observerTargetRef.current);
      }
    };
  }, [threshold, loadMore]);

  // Keyboard accessibility - Enter key to load more
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading && observerTargetRef.current) {
        onLoadMore();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [loading, onLoadMore]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-500">Loading more services...</p>
      </div>
    );
  }

  return (
    <>
      {children}
      <div
        ref={observerTargetRef}
        className="h-16 w-full"
        aria-hidden="true"
      />
    </>
  );
}

export default InfiniteScroll;
