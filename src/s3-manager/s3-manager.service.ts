import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import 'dotenv/config';
import { ErrorTemplate } from 'src/utils/error.dto';

@Injectable()
export class S3ManagerService {
    AWS_S3_BUCKET = 'eco-back';
    s3 = new AWS.S3({
      accessKeyId: process.env.AWS_CLIENT_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
  
    async uploadFile(file: Express.Multer.File) {
      try {
        const { originalname } = file;
    
        return await this.s3_upload(
          file.buffer,
          this.AWS_S3_BUCKET,
          originalname,
          file.mimetype,
        );
      } catch (error) {
        if (error instanceof ErrorTemplate)
          throw error;
        else
          throw new ErrorTemplate(500, error.message || 'Can\'t create upload file to S3 bucket.', 'S3');
      }
    }
  
    async s3_upload(file, bucket, name, mimetype) {
      const params = {
        Bucket: bucket,
        Key: String(name),
        Body: file,
        ContentType: mimetype,
        ContentDisposition: 'inline',
      };
  
      try {
        let s3Response = await this.s3.upload(params).promise();
        return s3Response;
      } catch (error) {
        throw new ErrorTemplate(500, error.message || 'Can\'t upload to S3.', 'S3');
      }
    }

    async s3_getSignedUrl(name: string): Promise<string> {
      try {
        const s3 = new S3Client({
          credentials: {
            accessKeyId: process.env.AWS_CLIENT_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
          },
          region: process.env.AWS_REGION,
        });
        const params = {
          Bucket: 'eco-back',
          Key: name,
        };
        const command = new GetObjectCommand(params);
        return await getSignedUrl(s3, command, {expiresIn: 3600});
      } catch (error) {
        throw new ErrorTemplate(500, error.message || `Can\'t create an url for the image with name : ${name}.`, 'S3');
      }
    }

    async s3_delete(name: string) {
      try {
        const s3 = new S3Client({
          credentials: {
            accessKeyId: process.env.AWS_CLIENT_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
          },
          region: process.env.AWS_REGION,
        });
        const params = {
          Bucket: 'eco-back',
          Key: name,
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
      } catch (error) {
        throw new ErrorTemplate(500, error.message || `Can\'t delete image with name : ${name}.`, 'S3');
      }
    }
}
