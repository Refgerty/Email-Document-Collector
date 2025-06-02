const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { Storage } = require('@google-cloud/storage');

class DocumentProcessor {
  constructor(userId) {
    this.storage = new Storage();
    this.bucket = this.storage.bucket(process.env.GCS_BUCKET);
    this.userId = userId;
  }

  async processAttachment(attachment) {
    const fileBuffer = Buffer.from(attachment.content, 'base64');
    const metadata = {
      originalName: attachment.filename,
      mimeType: attachment.contentType,
      userId: this.userId,
      processedAt: new Date()
    };

    // Convert documents to searchable format
    if (metadata.mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      metadata.textContent = data.text;
    } else if (metadata.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      metadata.textContent = result.value;
    }

    // Store in Google Cloud Storage
    const fileName = `${this.userId}/${Date.now()}-${attachment.filename}`;
    const file = this.bucket.file(fileName);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: metadata.mimeType,
        metadata: metadata
      }
    });

    return { ...metadata, storageUrl: file.publicUrl() };
  }
}