export class FileEntity {
  id!: string;

  path!: string;

  fileName!: string;

  originalName!: string;

  mimeType!: string;

  size?: number;

  bucket!: string;

  userId?: string;

  fileUrl?: string;

  createdAt!: Date;

  updatedAt!: Date;
}