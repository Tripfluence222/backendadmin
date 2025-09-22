import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { logger } from '../../lib/logger';

// Job interface for yoga center processing
export interface YogaCenterJob {
  name: string;
  website: string;
  location: string;
  description: string;
  category: string;
  sourceFile: string;
}

// Queue for yoga center processing jobs
export interface YogaCenterProcessor {
  enqueue(job: YogaCenterJob): Promise<void>;
}

/**
 * Reads yoga centers from CSV file and enqueues them for processing
 */
export class YogaCenterListProcessor {
  private processor: YogaCenterProcessor;
  private csvPath: string;

  constructor(processor: YogaCenterProcessor, csvPath: string = 'data/yoga_centers_bali.csv') {
    this.processor = processor;
    this.csvPath = csvPath;
  }

  /**
   * Process the CSV file and enqueue all yoga centers
   */
  async run(): Promise<{ total: number; enqueued: number; errors: number }> {
    const stats = { total: 0, enqueued: 0, errors: 0 };
    
    try {
      logger.info(`Starting to process yoga centers from ${this.csvPath}`);
      
      // Read and parse CSV file
      const csvFilePath = path.resolve(process.cwd(), this.csvPath);
      
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file not found: ${csvFilePath}`);
      }

      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      stats.total = records.length;
      logger.info(`Found ${stats.total} yoga centers to process`);

      // Process each record
      for (const record of records) {
        try {
          // Type assertion for CSV record
          const typedRecord = record as {
            name?: string;
            website?: string;
            location?: string;
            description?: string;
            category?: string;
          };

          // Validate required fields
          if (!typedRecord.name || !typedRecord.website) {
            logger.warn(`Skipping record with missing name or website:`, record);
            stats.errors++;
            continue;
          }

          // Create job data
          const jobData: YogaCenterJob = {
            name: typedRecord.name.trim(),
            website: typedRecord.website.trim(),
            location: typedRecord.location?.trim() || '',
            description: typedRecord.description?.trim() || '',
            category: typedRecord.category?.trim() || 'studio',
            sourceFile: this.csvPath,
          };

          // Enqueue the job
          await this.processor.enqueue(jobData);
          stats.enqueued++;
          
          logger.info(`Enqueued: ${jobData.name} (${jobData.website})`);
          
        } catch (error) {
          logger.error(`Error processing record:`, { record, error: error.message });
          stats.errors++;
        }
      }

      logger.info(`Processing complete. Stats:`, stats);
      return stats;
      
    } catch (error) {
      logger.error(`Error processing yoga centers list:`, error);
      throw error;
    }
  }
}

/**
 * Simple console-based processor for testing
 */
export class ConsoleYogaCenterProcessor implements YogaCenterProcessor {
  async enqueue(job: YogaCenterJob): Promise<void> {
    logger.info(`[CONSOLE] Would enqueue yoga center:`, {
      name: job.name,
      website: job.website,
      location: job.location,
      category: job.category,
    });
  }
}

/**
 * Main execution function
 */
export async function runFromList(csvPath?: string, processor?: YogaCenterProcessor) {
  const yogaProcessor = processor || new ConsoleYogaCenterProcessor();
  const listProcessor = new YogaCenterListProcessor(yogaProcessor, csvPath);
  
  return await listProcessor.run();
}

// CLI execution
if (require.main === module) {
  const csvPath = process.argv[2];
  runFromList(csvPath)
    .then((stats) => {
      console.log('Yoga center processing completed:', stats);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error processing yoga centers:', error);
      process.exit(1);
    });
}