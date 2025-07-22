import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { streamToString } from './streamUtils.js';

// S3 configuration
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pmp-question-service-bucket';
const QUESTIONS_PREFIX = 'questions/';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.CUSTOM_AWS_REGION || process.env.AWS_REGION || 'us-east-1'
});

/**
 * Get a file from S3
 * @param fileName The name of the file to get
 * @returns The file content as a string
 */
export async function getFileFromS3(fileName: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${QUESTIONS_PREFIX}${fileName}`
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error(`No content in S3 file: ${fileName}`);
    }
    
    return await streamToString(response.Body);
  } catch (error) {
    console.error(`Error getting file ${fileName} from S3:`, error);
    throw error;
  }
}

/**
 * Put a file to S3
 * @param fileName The name of the file to put
 * @param content The content of the file
 */
export async function putFileToS3(fileName: string, content: string): Promise<void> {
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
    console.error(`Error putting file ${fileName} to S3:`, error);
    throw error;
  }
}