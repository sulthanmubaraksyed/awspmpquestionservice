import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';

const s3 = new S3Client({});

export const handler = async (event: any) => {
  console.log('S3 Uploader triggered:', JSON.stringify(event, null, 2));
  
  try {
    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
      const { BucketName, Files } = event.ResourceProperties;
      
      console.log(`Uploading ${Files.length} files to bucket: ${BucketName}`);
      
      for (const file of Files) {
        try {
          const filePath = join(process.cwd(), 'src', 'questions', file);
          console.log(`Reading file: ${filePath}`);
          
          const content = readFileSync(filePath, 'utf-8');
          
          await s3.send(new PutObjectCommand({
            Bucket: BucketName,
            Key: `questions/${file}`,
            Body: content,
            ContentType: 'text/plain'
          }));
          
          console.log(`Successfully uploaded: questions/${file}`);
        } catch (fileError) {
          console.error(`Error uploading ${file}:`, fileError);
          throw fileError;
        }
      }
      
      console.log('All files uploaded successfully');
    }
    
    // Send success response to CloudFormation
    const response = {
      Status: 'SUCCESS',
      PhysicalResourceId: 'upload-complete',
      Data: {
        Message: 'Files uploaded successfully'
      }
    };
    
    console.log('Sending success response:', response);
    return response;
    
  } catch (error) {
    console.error('Error in S3 uploader:', error);
    
    // Send failure response to CloudFormation
    const response = {
      Status: 'FAILED',
      PhysicalResourceId: 'upload-failed',
      Reason: error instanceof Error ? error.message : 'Unknown error'
    };
    
    console.log('Sending failure response:', response);
    return response;
  }
};