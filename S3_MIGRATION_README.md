# PMP Question Service - S3 Migration Guide

This guide explains how to migrate the question files from local storage to Amazon S3 and deploy the updated service.

## Prerequisites

1. AWS CLI installed and configured
2. AWS SAM CLI installed
3. Node.js 18+ installed
4. AWS Account with appropriate permissions

## Migration Steps

### 1. Deploy the Updated Stack

```bash
# Build the application
npm install
npm run build
sam build

# Deploy to AWS
sam deploy --guided
```

During the guided deployment, you'll be asked to provide:
- Stack Name (e.g., pmp-question-service)
- AWS Region
- Confirm changes before deploy (Y)
- Allow SAM CLI IAM role creation (Y)
- Save arguments to configuration file (Y)

### 2. Upload Question Files to S3

After the stack is deployed, you can upload the question files to S3:

```bash
# Run the upload script
npm run upload-questions
```

This script will:
1. Read all question files from the `src/questions` directory
2. Upload them to the S3 bucket created during deployment
3. Store them under the `questions/` prefix

### 3. Verify the Migration

You can verify that the files were uploaded correctly by:

```bash
# List files in the S3 bucket
aws s3 ls s3://BUCKET_NAME/questions/ --recursive
```

Replace `BUCKET_NAME` with the actual bucket name from the stack outputs.

### 4. Test the Service

Test that the service is working correctly with the S3-based question files:

```bash
# Get the API Gateway URL
aws cloudformation describe-stacks \
  --stack-name pmp-question-service \
  --query 'Stacks[0].Outputs[?OutputKey==`PMPQuestionApi`].OutputValue' \
  --output text

# Test the API
curl -X GET "YOUR_API_GATEWAY_URL/health" \
  -H "X-API-Key: pmp_service_key_2024"

# Get questions
curl -X GET "YOUR_API_GATEWAY_URL/api/pmp-questions" \
  -H "X-API-Key: pmp_service_key_2024"
```

## Code Changes

The following changes were made to migrate from local file storage to S3:

1. Added S3 service utility (`src/utils/s3Service.ts`)
2. Added stream utility (`src/utils/streamUtils.ts`)
3. Updated question service to use S3 instead of local files (`src/utils/questionService.ts`)
4. Created upload script (`src/scripts/uploadQuestionsToS3.ts`)
5. Updated CloudFormation template to include S3 bucket and permissions

## Troubleshooting

### S3 Access Issues

If the Lambda function can't access the S3 bucket:

1. Check the IAM role permissions
2. Verify the environment variables are set correctly
3. Check CloudWatch logs for error messages

### File Format Issues

If the files are not being read correctly:

1. Check the file format in S3
2. Verify the file content matches the expected format
3. Try uploading the files manually using the AWS CLI

## Rollback Plan

If you need to roll back to local file storage:

1. Revert the code changes
2. Redeploy the stack
3. The service will use local files again