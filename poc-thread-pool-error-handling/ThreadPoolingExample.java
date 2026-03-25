import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadPoolingExample {

    private static final int MAX_COUNT = 10;
    private static final ExecutorService threadPool = Executors.newFixedThreadPool(3);
    private static final AtomicInteger counter = new AtomicInteger(0);

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Fixed Thread Pool Example ===");
        System.out.println("Thread Pool Size: 3");
        System.out.println("Starting to count from 1 to " + MAX_COUNT);
        System.out.println("================================\n");

        try {
            for (int i = 0; i < MAX_COUNT; i++) {
                // Submit a task to the thread pool for each count
                final int count = i + 1;
                threadPool.submit(() -> {
                    try {
                        // Simulate some work
                        Thread.sleep(100);
                        System.out.println("Thread [" + Thread.currentThread().getName() +
                                          "] processed count: " + count);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        System.err.println("Task interrupted");
                    } catch (RuntimeException e) {
                        // This simulates the exception thrown at count 7
                        if (count == 7) {
                            System.err.println("Throwing RuntimeException at count: " + count);
                            throw new RuntimeException("Simulated runtime exception at count " + count, e);
                        }
                    }
                    return null;
                });

                // Allow time for task to execute and check if we should stop
                Thread.sleep(50);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println("Main thread interrupted");
        }

        // Wait for all tasks to complete
        threadPool.shutdown();
        while (!threadPool.awaitTermination(1, TimeUnit.SECONDS)) {
            if (!threadPool.shutdownNow()) {
                // If shutdown() fails, retry with shutdownNow()
                if (!threadPool.awaitTermination(1, TimeUnit.SECONDS)) {
                    System.err.println("Pool could not be shut down within timeout");
                    return;
                }
            }
        }

        System.out.println("\nAll tasks completed.");
        System.out.println("Counter final value: " + counter.get());
    }
}
