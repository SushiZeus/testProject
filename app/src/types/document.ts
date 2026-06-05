export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: 'pdf' | 'image' | 'excel' | 'word' | 'other';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  
  // Metadata
  uploadedBy: string;
  uploadedAt: Date;
  lastModified: Date;
  
  // Classification
  category: 'shipment' | 'petty_cash' | 'leave' | 'user_profile' | 'system';
  subCategory?: string;
  tags: string[];
  
  // Relationships
  relatedFileId?: string;
  relatedRequestId?: string;
  relatedUserId?: string;
  
  // Content
  description?: string;
  extractedText?: string;
  
  // Access Control
  visibility: 'public' | 'department' | 'role_specific' | 'private';
  allowedRoles: string[];
  allowedUsers: string[];
  
  // Status
  status: 'active' | 'archived' | 'deleted';
  version: number;
  isLatestVersion: boolean;
}

export interface DocumentFilter {
  category?: string;
  fileType?: string;
  uploadedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  searchText?: string;
}

export interface DocumentUploadData {
  file: File;
  category: Document['category'];
  subCategory?: string;
  description?: string;
  tags?: string[];
  relatedFileId?: string;
  relatedRequestId?: string;
  visibility?: Document['visibility'];
}