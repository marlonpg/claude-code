package org.example.poc;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.ArrayList;
import java.util.List;

/**
 * Fixed Thread Pool POC - Counts from 1 to 10 and throws RuntimeException
 *
 * Features:
 * - Uses FixedThreadPool with 3 threads
 * - Logs each count from 1 to 10
 * - Throws RuntimeException at count 7
 * - Demonstrates proper exception handling in thread pools
 */
public class ThreadPoolingWithException {

    private static final int MAX_COUNT = 10;
    private static final int THREAD_POOL_SIZE = 1;
    private static final int WORK_DELAY_MS = 100;
    private static final int CHECK_DELAY_MS = 50;

    // Track completed counts
    private static final List<Integer> completedCounts = new ArrayList<>();
    private static final AtomicInteger failedCount = new AtomicInteger(0);

    public static void main(String[] args) {
        System.out.println("================================================");
        System.out.println("   Fixed Thread Pool - Counting & Exception Demo");
        System.out.println("================================================\n");

        // Create a simple queue with 10 items (1 to 10)
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10);
        for (int i = 1; i <= 10; i++) {
            queue.add(i);
        }

        // Create fixed thread pool
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE);

        Runnable worker = () -> {
            while (!queue.isEmpty()) {
                Integer item = queue.poll();
                if (item == null) break;
                int count = failedCount.incrementAndGet();
                System.out.println("Processing item: " + item + ", failedCount: " + count);
                if (count == 8) {
                    throw new RuntimeException("Failed count reached 8!");
                }
                try {
                    Thread.sleep(WORK_DELAY_MS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        };

        executor.execute(worker);

        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
