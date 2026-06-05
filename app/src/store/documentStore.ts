import { useState, useEffect } from 'react';
import type { Document, DocumentFilter, DocumentUploadData } from '@/types/document';

interface DocumentState {
  documents: Document[];
  uploadDocument: (data: DocumentUploadData, userId: string) => Promise<Document>;
  getDocuments: (filter?: DocumentFilter) => Document[];
  getDocumentById: (id: string) => Document | undefined;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  searchDocuments: (query: string) => Document[];
  getDocumentsByCategory: (category: Document['category']) => Document[];
  getDocumentsByUser: (userId: string) => Document[];
  getUserAccessibleDocuments: (userId: string, userRole: string) => Document[];
}

// Helper function to determine file type from MIME type
const getFileType = (mimeType: string): Document['fileType'] => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  return 'other';
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to generate thumbnail for images
const generateThumbnail = async (file: File): Promise<string | undefined> => {
  if (!file.type.startsWith('image/')) return undefined;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set thumbnail size
      const maxSize = 200;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    
    img.onerror = () => resolve(undefined);
    img.src = URL.createObjectURL(file);
  });
};

// Load state from localStorage
const loadState = () => {
  if (typeof window === 'undefined') {
    return { documents: [] };
  }

  try {
    const savedState = localStorage.getItem('documentStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        documents: parsed.documents.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          lastModified: new Date(doc.lastModified),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading document state:', error);
  }

  return { documents: [] };
};

// Save state to localStorage
const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('documentStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving document state:', error);
    }
  }
};

let state: { documents: Document[] } = loadState();

const listeners = new Set<() => void>();
const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useDocumentStore = (): DocumentState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get documents() { return state.documents; },

    uploadDocument: async (data: DocumentUploadData, userId: string): Promise<Document> => {
      try {
        const fileUrl = await fileToBase64(data.file);
        const thumbnailUrl = await generateThumbnail(data.file);
        
        const document: Document = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: `${Date.now()}_${data.file.name}`,
          originalName: data.file.name,
          fileType: getFileType(data.file.type),
          mimeType: data.file.type,
          fileSize: data.file.size,
          fileUrl,
          thumbnailUrl,
          
          uploadedBy: userId,
          uploadedAt: new Date(),
          lastModified: new Date(),
          
          category: data.category,
          subCategory: data.subCategory,
          tags: data.tags || [],
          
          relatedFileId: data.relatedFileId,
          relatedRequestId: data.relatedRequestId,
          relatedUserId: userId,
          
          description: data.description,
          extractedText: '', // TODO: Implement OCR
          
          visibility: data.visibility || 'role_specific',
          allowedRoles: [], // Will be set based on category
          allowedUsers: [userId],
          
          status: 'active',
          version: 1,
          isLatestVersion: true,
        };

        // Set allowed roles based on category
        switch (data.category) {
          case 'shipment':
            document.allowedRoles = ['administrator', 'documentation_officer', 'declaration_manager', 'declarant', 'operations_manager', 'operation_clerk'];
            break;
          case 'petty_cash':
            document.allowedRoles = ['administrator', 'operations_manager', 'operation_clerk', 'declaration_manager', 'hr_manager', 'finance_manager', 'coo', 'cashier'];
            break;
          case 'leave':
            document.allowedRoles = ['administrator', 'hr_manager'];
            document.allowedUsers.push(userId); // User can always see their own leave documents
            break;
          case 'user_profile':
            document.allowedRoles = ['administrator', 'hr_manager'];
            document.allowedUsers.push(userId);
            break;
          case 'system':
            document.allowedRoles = ['administrator'];
            break;
        }

        state = {
          ...state,
          documents: [...state.documents, document],
        };

        notify();
        return document;
      } catch (error) {
        console.error('Error uploading document:', error);
        throw new Error('Failed to upload document');
      }
    },

    getDocuments: (filter?: DocumentFilter) => {
      let filtered = state.documents.filter(doc => doc.status === 'active');

      if (filter) {
        if (filter.category) {
          filtered = filtered.filter(doc => doc.category === filter.category);
        }
        if (filter.fileType) {
          filtered = filtered.filter(doc => doc.fileType === filter.fileType);
        }
        if (filter.uploadedBy) {
          filtered = filtered.filter(doc => doc.uploadedBy === filter.uploadedBy);
        }
        if (filter.dateFrom) {
          filtered = filtered.filter(doc => doc.uploadedAt >= filter.dateFrom!);
        }
        if (filter.dateTo) {
          filtered = filtered.filter(doc => doc.uploadedAt <= filter.dateTo!);
        }
        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter(doc => 
            filter.tags!.some(tag => doc.tags.includes(tag))
          );
        }
        if (filter.searchText) {
          const searchLower = filter.searchText.toLowerCase();
          filtered = filtered.filter(doc => 
            doc.originalName.toLowerCase().includes(searchLower) ||
            doc.description?.toLowerCase().includes(searchLower) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
            doc.extractedText?.toLowerCase().includes(searchLower)
          );
        }
      }

      return filtered.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    },

    getDocumentById: (id: string) => {
      return state.documents.find(doc => doc.id === id && doc.status === 'active');
    },

    updateDocument: (id: string, updates: Partial<Document>) => {
      state = {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === id
            ? { ...doc, ...updates, lastModified: new Date() }
            : doc
        ),
      };
      notify();
    },

    deleteDocument: (id: string) => {
      const document = state.documents.find(doc => doc.id === id);
      if (!document) return;

      // Soft delete - mark as deleted instead of removing
      state = {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === id
            ? { ...doc, status: 'deleted' as const, lastModified: new Date() }
            : doc
        ),
      };
      notify();
    },

    searchDocuments: (query: string) => {
      const searchLower = query.toLowerCase();
      return state.documents
        .filter(doc => doc.status === 'active')
        .filter(doc => 
          doc.originalName.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          doc.extractedText?.toLowerCase().includes(searchLower)
        )
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    },

    getDocumentsByCategory: (category: Document['category']) => {
      return state.documents
        .filter(doc => doc.status === 'active' && doc.category === category)
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    },

    getDocumentsByUser: (userId: string) => {
      return state.documents
        .filter(doc => doc.status === 'active' && doc.uploadedBy === userId)
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    },

    getUserAccessibleDocuments: (userId: string, userRole: string) => {
      return state.documents
        .filter(doc => {
          if (doc.status !== 'active') return false;
          
          // Administrator can see all documents
          if (userRole === 'administrator') return true;
          
          // User can see their own documents
          if (doc.uploadedBy === userId) return true;
          
          // Check if user is in allowed users list
          if (doc.allowedUsers.includes(userId)) return true;
          
          // Check if user role is in allowed roles
          if (doc.allowedRoles.includes(userRole)) return true;
          
          // Public documents are visible to all
          if (doc.visibility === 'public') return true;
          
          return false;
        })
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    },
  };
};