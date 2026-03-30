import React, { useMemo, useState } from 'react';
import { Loader2, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const formatRelativeTime = (dateString) => {
  if (!dateString) {
    return '';
  }

  return new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }).format(
    Math.round((new Date(dateString).getTime() - Date.now()) / 60000),
    'minute'
  );
};

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const updateCommentInList = (comments, commentId, updater) =>
  (comments || []).map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    const replies = comment.replies || [];
    if (!replies.some((reply) => reply.id === commentId)) {
      return comment;
    }

    return {
      ...comment,
      replies: replies.map((reply) => (reply.id === commentId ? updater(reply) : reply)),
    };
  });

const removeCommentFromList = (comments, commentId) => {
  let removedCount = 0;
  const nextComments = [];

  for (const comment of comments || []) {
    if (comment.id === commentId) {
      removedCount = 1 + (comment.replies?.length || 0);
      continue;
    }

    const replies = comment.replies || [];
    const nextReplies = replies.filter((reply) => reply.id !== commentId);

    if (nextReplies.length !== replies.length) {
      const removedReplies = replies.length - nextReplies.length;
      removedCount = removedReplies;
      nextComments.push({
        ...comment,
        replies: nextReplies,
        replies_count: Math.max(0, (comment.replies_count || replies.length) - removedReplies),
      });
      continue;
    }

    nextComments.push(comment);
  }

  return {
    comments: nextComments,
    removedCount,
  };
};

const CommentItem = ({
  comment,
  isReply = false,
  onReplyClick,
  replyingTo,
  replyBody,
  setReplyBody,
  submitReply,
  isReplyPending,
  user,
  navigate,
  editingCommentId,
  editBody,
  setEditBody,
  startEditing,
  cancelEditing,
  submitEdit,
  deleteComment,
  updatingCommentId,
  deletingCommentId,
}) => {
  const isEditing = editingCommentId === comment.id;
  const canManage = user?.id === comment.author?.id;
  const isUpdating = updatingCommentId === comment.id;
  const isDeleting = deletingCommentId === comment.id;

  return (
    <div className="flex gap-3">
      <Avatar className={isReply ? 'h-8 w-8' : 'h-9 w-9'}>
        <AvatarImage src={comment.author?.avatar_url} />
        <AvatarFallback>{getInitials(comment.author?.name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className={`rounded-2xl px-4 py-3 ${isReply ? 'bg-white ring-1 ring-neutral-100' : 'bg-neutral-50'}`}>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-900">{comment.author?.name || 'مستخدم'}</span>
            <span className="text-xs text-neutral-700">{formatRelativeTime(comment.created_at)}</span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
                maxLength={1000}
                className="min-h-[90px] rounded-2xl border-roman-500/20 bg-white"
                placeholder="عدّل تعليقك"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-700">{editBody.length}/1000</span>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={cancelEditing}>
                    إلغاء
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => submitEdit(comment.id)}
                    disabled={isUpdating || !editBody.trim()}
                  >
                    {isUpdating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    حفظ
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">{comment.body}</p>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-4 px-1 text-xs">
          {!isReply && (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }

                onReplyClick(comment.id);
              }}
              className="font-medium text-neutral-500 transition hover:text-roman-500"
            >
              رد
            </button>
          )}

          {canManage && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => startEditing(comment)}
                className="inline-flex items-center gap-1 font-medium text-neutral-500 transition hover:text-roman-500"
              >
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </button>
              <button
                type="button"
                onClick={() => deleteComment(comment)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 font-medium text-neutral-500 transition hover:text-red-600 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                حذف
              </button>
            </>
          )}

          {!isReply && comment.replies_count > 0 && <span className="text-neutral-700">{comment.replies_count} رد</span>}
        </div>

        {!isReply && replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              placeholder={`اكتب رداً على ${comment.author?.name || 'هذا التعليق'}...`}
              className="min-h-[90px] rounded-2xl border-roman-500/20"
              maxLength={1000}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => submitReply(comment.id)}
                disabled={isReplyPending || !replyBody.trim()}
                className="rounded-xl"
              >
                {isReplyPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
                إرسال الرد
              </Button>
            </div>
          </div>
        )}

        {!isReply && comment.replies?.length > 0 && (
          <div className="mt-4 space-y-3 border-r border-neutral-200 pr-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                onReplyClick={onReplyClick}
                replyingTo={replyingTo}
                replyBody={replyBody}
                setReplyBody={setReplyBody}
                submitReply={submitReply}
                isReplyPending={isReplyPending}
                user={user}
                navigate={navigate}
                editingCommentId={editingCommentId}
                editBody={editBody}
                setEditBody={setEditBody}
                startEditing={startEditing}
                cancelEditing={cancelEditing}
                submitEdit={submitEdit}
                deleteComment={deleteComment}
                updatingCommentId={updatingCommentId}
                deletingCommentId={deletingCommentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentsSection = ({ postId, onCountChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editBody, setEditBody] = useState('');

  const queryKey = useMemo(() => ['community-comments', postId], [postId]);

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => api.community.getComments(postId),
    enabled: Boolean(postId),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ body: commentBody, parentId = null }) =>
      api.community.addComment(postId, {
        body: commentBody,
        parent_id: parentId,
      }),
    onMutate: async ({ body: commentBody, parentId = null }) => {
      const tempId = `temp-${Date.now()}`;

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const optimisticComment = {
        id: tempId,
        body: commentBody,
        created_at: new Date().toISOString(),
        author: {
          id: user?.id,
          name: user?.name,
          avatar_url: user?.avatar,
        },
        replies: [],
        replies_count: 0,
      };

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) {
          return {
            data: parentId ? [] : [optimisticComment],
          };
        }

        const currentComments = old.data || [];

        if (!parentId) {
          return {
            ...old,
            data: [optimisticComment, ...currentComments],
          };
        }

        return {
          ...old,
          data: currentComments.map((comment) => {
            if (comment.id !== parentId) {
              return comment;
            }

            return {
              ...comment,
              replies_count: (comment.replies_count || 0) + 1,
              replies: [optimisticComment, ...(comment.replies || [])].slice(0, 10),
            };
          }),
        };
      });

      onCountChange?.(1);

      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      onCountChange?.(-1);
      toast({
        variant: 'destructive',
        title: 'تعذر إضافة التعليق',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
    onSuccess: () => {
      setBody('');
      setReplyBody('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, body: nextBody }) => api.community.updateComment(commentId, { body: nextBody }),
    onMutate: async ({ commentId, body: nextBody }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          data: updateCommentInList(old.data || [], commentId, (comment) => ({
            ...comment,
            body: nextBody,
          })),
        };
      });

      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast({
        variant: 'destructive',
        title: 'تعذر تعديل التعليق',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
    onSuccess: (updatedComment, variables) => {
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          data: updateCommentInList(old.data || [], variables.commentId, (comment) => ({
            ...comment,
            ...updatedComment,
            replies: updatedComment.replies ?? comment.replies ?? [],
            replies_count: updatedComment.replies_count ?? comment.replies_count ?? 0,
          })),
        };
      });

      setEditingCommentId(null);
      setEditBody('');
      toast({
        title: 'تم تعديل التعليق',
        description: 'تم حفظ التغييرات بنجاح.',
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => api.community.deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      let removedCount = 0;

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) {
          return old;
        }

        const result = removeCommentFromList(old.data || [], commentId);
        removedCount = result.removedCount;

        return {
          ...old,
          data: result.comments,
        };
      });

      if (removedCount > 0) {
        onCountChange?.(-removedCount);
      }

      return { previousData, removedCount };
    },
    onError: (error, _commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      if (context?.removedCount) {
        onCountChange?.(context.removedCount);
      }

      toast({
        variant: 'destructive',
        title: 'تعذر حذف التعليق',
        description: error.message || 'حاول مرة أخرى.',
      });
    },
    onSuccess: (response, commentId, context) => {
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditBody('');
      }

      if (replyingTo === commentId) {
        setReplyingTo(null);
        setReplyBody('');
      }

      if (response?.deleted_count && context?.removedCount && response.deleted_count !== context.removedCount) {
        onCountChange?.(-(response.deleted_count - context.removedCount));
      }

      queryClient.invalidateQueries({ queryKey });
    },
  });

  const submitComment = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!body.trim()) {
      return;
    }

    addCommentMutation.mutate({ body });
  };

  const submitReply = (parentId) => {
    if (!replyBody.trim()) {
      return;
    }

    addCommentMutation.mutate({
      body: replyBody,
      parentId,
    });
  };

  const startEditing = (comment) => {
    setReplyingTo(null);
    setReplyBody('');
    setEditingCommentId(comment.id);
    setEditBody(comment.body || '');
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditBody('');
  };

  const submitEdit = (commentId) => {
    const normalizedBody = editBody.trim();

    if (!normalizedBody) {
      return;
    }

    updateCommentMutation.mutate({
      commentId,
      body: normalizedBody,
    });
  };

  const handleDeleteComment = (comment) => {
    deleteCommentMutation.mutate(comment.id);
  };

  const comments = commentsQuery.data?.data || [];
  const updatingCommentId = updateCommentMutation.isPending ? updateCommentMutation.variables?.commentId : null;
  const deletingCommentId = deleteCommentMutation.isPending ? deleteCommentMutation.variables : null;

  return (
    <div className="border-t border-neutral-100 px-5 py-4">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-neutral-500" />
        <h4 className="text-sm font-semibold text-neutral-700">التعليقات</h4>
      </div>

      {commentsQuery.isLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
          لا توجد تعليقات بعد. ابدأ النقاش.
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReplyClick={(commentId) => {
                setEditingCommentId(null);
                setEditBody('');
                setReplyingTo((current) => (current === commentId ? null : commentId));
                setReplyBody('');
              }}
              replyingTo={replyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              submitReply={submitReply}
              isReplyPending={addCommentMutation.isPending && replyingTo === comment.id}
              user={user}
              navigate={navigate}
              editingCommentId={editingCommentId}
              editBody={editBody}
              setEditBody={setEditBody}
              startEditing={startEditing}
              cancelEditing={cancelEditing}
              submitEdit={submitEdit}
              deleteComment={handleDeleteComment}
              updatingCommentId={updatingCommentId}
              deletingCommentId={deletingCommentId}
            />
          ))}
        </div>
      )}

      {user ? (
        <div className="mt-5 space-y-3">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="اكتب تعليقاً..."
            className="min-h-[100px] rounded-2xl border-roman-500/20"
            maxLength={1000}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-700">{body.length}/1000</span>
            <Button
              type="button"
              onClick={submitComment}
              disabled={addCommentMutation.isPending || !body.trim()}
              className="rounded-xl"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="ml-2 h-4 w-4" />
              )}
              تعليق
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-roman-50 px-4 py-3 text-sm text-neutral-600 ring-1 ring-roman-100">
          سجّل الدخول للمشاركة بالتعليقات.
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mr-2 font-semibold text-roman-500"
          >
            تسجيل الدخول
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
