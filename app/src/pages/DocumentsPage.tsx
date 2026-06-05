import { useState, useMemo } from 'react';
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Upload,
  Search,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  FolderOpen,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useDocumentStore } from '@/store/documentStore';
import type { Document } from '@/types/document';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';

interface DocumentsPageProps {
  navigate: (route: AppRoute) => void;
}

const getFileIcon = (fileType: Document['fileType']) => {
  switch (fileType) {
    case 'image':
      return Image;
    case 'pdf':
      return FileText;
    case 'excel':
      return FileSpreadsheet;
    case 'word':
      return FileText;
    default:
      return File;
  }
};

const getFileTypeColor = (fileType: Document['fileType']) => {
  switch (fileType) {
    case 'image':
      return 'bg-green-100 text-green-700';
    case 'pdf':
      return 'bg-red-100 text-red-700';
    case 'excel':
      return 'bg-emerald-100 text-emerald-700';
    case 'word':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getCategoryColor = (category: Document['category']) => {
  switch (category) {
    case 'shipment':
      return 'bg-blue-100 text-blue-700';
    case 'petty_cash':
      return 'bg-green-100 text-green-700';
    case 'leave':
      return 'bg-purple-100 text-purple-700';
    case 'user_profile':
      return 'bg-orange-100 text-orange-700';
    case 'system':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentsPage({}: DocumentsPageProps) {
  const { user } = useAuthStore();
  const { getUserAccessibleDocuments, searchDocuments } = useDocumentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Get documents based on user access
  const allDocuments = useMemo(() => {
    if (!user) return [];
    return getUserAccessibleDocuments(user.id, user.role);
  }, [user, getUserAccessibleDocuments]);

  // Apply filters
  const filteredDocuments = useMemo(() => {
    let docs = allDocuments;

    if (searchQuery) {
      docs = searchDocuments(searchQuery);
    }

    if (selectedCategory !== 'all') {
      docs = docs.filter(doc => doc.category === selectedCategory);
    }

    if (selectedFileType !== 'all') {
      docs = docs.filter(doc => doc.fileType === selectedFileType);
    }

    return docs;
  }, [allDocuments, searchQuery, selectedCategory, selectedFileType, searchDocuments]);

  // Get statistics
  const stats = useMemo(() => {
    const total = allDocuments.length;
    const byCategory = allDocuments.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byFileType = allDocuments.reduce((acc, doc) => {
      acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byCategory, byFileType };
  }, [allDocuments]);

  const handleDownload = (document: Document) => {
    const link = window.document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.originalName;
    link.click();
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Manage and search all your documents in one place
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '#files/open'} 
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.byCategory.shipment || 0}</p>
                <p className="text-sm text-gray-500">Shipment Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.byFileType.image || 0}</p>
                <p className="text-sm text-gray-500">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.byFileType.pdf || 0}</p>
                <p className="text-sm text-gray-500">PDFs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="shipment">Shipment</option>
                <option value="petty_cash">Petty Cash</option>
                <option value="leave">Leave</option>
                <option value="user_profile">User Profile</option>
                <option value="system">System</option>
              </select>

              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="excel">Excel</option>
                <option value="word">Word</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedCategory !== 'all' || selectedFileType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => {
            const FileIcon = getFileIcon(document.fileType);
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* File Icon/Thumbnail */}
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      getFileTypeColor(document.fileType)
                    )}>
                      {document.thumbnailUrl ? (
                        <img
                          src={document.thumbnailUrl}
                          alt={document.originalName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileIcon className="w-6 h-6" />
                      )}
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {document.originalName}
                        </h3>
                        <Badge variant="secondary" className={cn('text-xs', getCategoryColor(document.category))}>
                          {document.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {document.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {document.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {document.uploadedAt.toLocaleDateString('en-GB')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {document.uploadedBy}
                        </span>
                        <span>{formatFileSize(document.fileSize)}</span>
                      </div>

                      {document.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <div className="flex gap-1">
                            {document.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{document.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(document)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectedDocument(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDocument.originalName}
              </h2>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedDocument.fileType === 'image' ? (
                <img
                  src={selectedDocument.fileUrl}
                  alt={selectedDocument.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : selectedDocument.fileType === 'pdf' ? (
                <iframe
                  src={selectedDocument.fileUrl}
                  className="w-full h-96 border-0"
                  title={selectedDocument.originalName}
                />
              ) : (
                <div className="text-center py-8">
                  <File className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">
                    Preview not available for this file type
                  </p>
                  <Button onClick={() => handleDownload(selectedDocument)}>
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}