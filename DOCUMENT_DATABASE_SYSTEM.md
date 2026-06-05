# Document Database System Implementation

## Overview

A comprehensive document management system that stores all uploaded documents and photos with metadata, allowing users to search, filter, and retrieve documents based on their roles and permissions.

## Database Structure

### Document Storage Schema

```typescript
interface Document {
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
  extractedText?: string; // For searchable content
  
  // Access Control
  visibility: 'public' | 'department' | 'role_specific' | 'private';
  allowedRoles: string[];
  allowedUsers: string[];
  
  // Status
  status: 'active' | 'archived' | 'deleted';
  version: number;
  isLatestVersion: boolean;
}
```

## Implementation Plan

### 1. Document Store Creation

Create a centralized document store that manages all file uploads and metadata.

### 2. Document Management Page

A dedicated page where users can:
- View all documents they have access to
- Search and filter documents
- Upload new documents
- Download/view documents
- Manage document metadata

### 3. Integration Points

- File Opening Page: Documents attached to shipment files
- Petty Cash: Receipt and supporting documents
- Leave Management: Medical certificates, supporting documents
- User Profiles: Profile photos, ID documents
- System Documents: Templates, forms, guidelines

### 4. Search and Filter Capabilities

- Full-text search in document content
- Filter by file type, date range, category
- Filter by uploader, related file/request
- Advanced search with multiple criteria

### 5. Access Control

Role-based access to documents:
- **Administrator**: Access to all documents
- **HR Manager**: Access to leave documents, user profiles
- **Finance Manager**: Access to petty cash receipts
- **Documentation Officer**: Access to shipment documents
- **Users**: Access to their own uploaded documents

## File Structure

```
app/src/
├── pages/
│   └── DocumentsPage.tsx          # Main document management page
├── components/
│   ├── DocumentUpload.tsx         # File upload component
│   ├── DocumentViewer.tsx         # Document preview/viewer
│   ├── DocumentSearch.tsx         # Search and filter interface
│   └── DocumentCard.tsx           # Document display card
├── store/
│   └── documentStore.ts           # Document state management
├── utils/
│   ├── fileUtils.ts              # File handling utilities
│   └── documentSearch.ts         # Search functionality
└── types/
    └── document.ts               # Document type definitions
```

## Features to Implement

### Core Features
1. **Document Upload**: Drag-and-drop, multiple file support
2. **Document Viewer**: In-browser preview for common formats
3. **Search Engine**: Full-text search with filters
4. **Version Control**: Track document versions
5. **Metadata Management**: Tags, descriptions, categories
6. **Access Control**: Role-based permissions

### Advanced Features
1. **Thumbnail Generation**: Auto-generate previews
2. **OCR Integration**: Extract text from images/PDFs
3. **Bulk Operations**: Mass upload, delete, tag
4. **Document Templates**: Reusable document templates
5. **Audit Trail**: Track all document activities
6. **Export/Import**: Backup and restore documents

## Storage Options

### Option 1: Enhanced localStorage (Current)
- Store document metadata in localStorage
- Use base64 encoding for small files
- Suitable for demo/development

### Option 2: IndexedDB (Recommended)
- Better performance for large files
- Structured database queries
- Offline capability

### Option 3: Server Integration (Production)
- Real file storage on server
- Database for metadata
- Proper security and backup

## User Interface Design

### Document Management Page Layout
```
┌─────────────────────────────────────────────────────────┐
│ Documents                                    [+ Upload] │
├─────────────────────────────────────────────────────────┤
│ Search: [_______________] Filters: [Type▼] [Date▼] [▼]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────┐ Document 1.pdf                    📅 2024-03-11 │
│ │ PDF │ Shipment Invoice - File ABC-001   👤 John Smith │
│ └─────┘ 2.3 MB                           🏷️ invoice     │
├─────────────────────────────────────────────────────────┤
│ ┌─────┐ Receipt_001.jpg                  📅 2024-03-10 │
│ │ IMG │ Petty Cash Receipt - Fuel        👤 Sarah Lee  │
│ └─────┘ 1.1 MB                           🏷️ receipt    │
└─────────────────────────────────────────────────────────┘
```

## Implementation Priority

### Phase 1: Basic Document Store
1. Create document store and types
2. Basic upload functionality
3. Simple document listing
4. Role-based access control

### Phase 2: Search and Management
1. Advanced search functionality
2. Document categorization
3. Metadata management
4. Document viewer

### Phase 3: Advanced Features
1. Version control
2. Thumbnail generation
3. Bulk operations
4. Audit trail

## Integration with Existing System

### Current Upload Points
1. **File Opening**: Commercial invoices, BL/AWB, packing lists
2. **Petty Cash**: Receipts, supporting documents
3. **Leave Management**: Medical certificates
4. **User Profiles**: Profile photos

### Unified Document Flow
All uploads will go through the document store, maintaining relationships with their source modules while being searchable from the central documents page.

## Security Considerations

1. **File Type Validation**: Restrict dangerous file types
2. **Size Limits**: Prevent large file uploads
3. **Virus Scanning**: Check uploaded files (future)
4. **Access Logging**: Track who accessed what documents
5. **Data Encryption**: Encrypt sensitive documents

## Benefits

1. **Centralized Management**: All documents in one place
2. **Better Search**: Find documents across all modules
3. **Audit Trail**: Track document lifecycle
4. **Compliance**: Meet document retention requirements
5. **Efficiency**: Reduce duplicate uploads
6. **Backup**: Centralized backup strategy

This system will transform the current scattered document handling into a professional document management solution.