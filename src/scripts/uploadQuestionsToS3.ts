import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 configuration
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pmp-question-service-bucket';
const QUESTIONS_PREFIX = 'questions/';

// Process group to file mapping
const PROCESS_GROUP_FILES = {
  "Initiating": "in.ts",
  "Planning": "pl.ts", 
  "Executing": "ex.ts",
  "Monitoring and Controlling": "mc.ts",
  "Closing": "cl.ts"
};

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.CUSTOM_AWS_REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Upload a file to S3
 * @param fileName The name of the file to upload
 * @param content The content of the file
 */
async function uploadFileToS3(fileName: string, content: string): Promise<void> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${QUESTIONS_PREFIX}${fileName}`,
      Body: content,
      ContentType: 'application/json'
    });
    
    await s3Client.send(command);
    console.log(`✅ File ${fileName} uploaded to S3 successfully`);
  } catch (error) {
    console.error(`❌ Error uploading file ${fileName} to S3:`, error);
    throw error;
  }
}

/**
 * Upload all question files to S3
 */
async function uploadQuestionsToS3(): Promise<void> {
  try {
    console.log('=== Starting upload of question files to S3 ===');
    console.log(`Bucket: ${BUCKET_NAME}`);
    console.log(`Prefix: ${QUESTIONS_PREFIX}`);
    
    // Upload each question file
    for (const [processGroup, fileName] of Object.entries(PROCESS_GROUP_FILES)) {
      try {
        const filePath = path.join(__dirname, '..', 'questions', fileName);
        console.log(`Reading file: ${filePath}`);
        
        const fileContent = await fs.readFile(filePath, 'utf-8');
        console.log(`File ${fileName} read successfully, size: ${fileContent.length} bytes`);
        
        await uploadFileToS3(fileName, fileContent);
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error);
      }
    }
    
    console.log('=== Upload of question files to S3 completed ===');
  } catch (error) {
    console.error('❌ Error in uploadQuestionsToS3:', error);
    process.exit(1);
  }
}

// Run the upload function
uploadQuestionsToS3();