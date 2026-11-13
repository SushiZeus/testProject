import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';

interface Props {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function CommentsPage({ navigate }: Props) {
  const { user } = useAuthStore();
  const fileStore = useFileStore();
  const files = fileStore.files;
  const [selectedFileId, setSelectedFileId] = useState('');
  const [draft, setDraft] = useState('');
  const selectedFile = files.find((file) => file.id === selectedFileId) || files[0];
  const comments = selectedFile
    ? fileStore.getActivityLogs(selectedFile.id).filter((log) => log.action === 'COMMENT_ADDED')
    : [];

  const postComment = () => {
    if (!user || !selectedFile || !draft.trim()) return;
    fileStore.addComment(selectedFile.id, user.id, draft.trim());
    setDraft('');
    toast.success('Comment added to the shipment file');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">File Comments</h1>
        <p className="mt-1 text-sm text-slate-600">View and add comments on any shipment file.</p>
      </div>

      {!selectedFile ? (
        <Card><CardContent className="p-8 text-center text-slate-500">No shipment files are available yet.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Conversation</CardTitle>
              <CardDescription>Comments are visible to users who open this file.</CardDescription>
            </div>
            <select
              aria-label="Select a shipment file"
              value={selectedFile.id}
              onChange={(event) => setSelectedFileId(event.target.value)}
              className="h-10 min-w-64 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id}>{file.fileNumber} · {file.shipmentType} {file.transportMode}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 p-3">
              <div>
                <p className="font-semibold text-slate-900">{selectedFile.fileNumber}</p>
                <p className="text-sm text-slate-600">{selectedFile.client?.name || 'Client details unavailable'} · {selectedFile.status.replace(/_/g, ' ')}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('files/:id', { id: selectedFile.id })}>Open file</Button>
            </div>

            <div className="space-y-3">
              <Textarea
                aria-label={`Add comment to ${selectedFile.fileNumber}`}
                placeholder="Write a comment for this shipment file..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={postComment} disabled={!draft.trim()}><Send className="mr-2 h-4 w-4" />Post comment</Button>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              {comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No comments on this file yet.</p>
              ) : comments.map((entry) => {
                const author = entry.user?.name || 'System user';
                return (
                  <article key={entry.id} className="flex gap-3 rounded-lg border bg-white p-4">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback>{author.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{author}</span>
                        <time className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</time>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{entry.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
