<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostCommentResource;
use App\Http\Resources\PostResource;
use App\Http\Resources\ReviewResource;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostEmbed;
use App\Models\PostMedia;
use App\Models\PostReaction;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\UserFollow;
use App\Services\EmbedService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CommunityController extends Controller
{
    public function feed(Request $request)
    {
        $user = $request->user();
        $followingOnly = $request->boolean('following_only', false);
        $authorId = (int) $request->query('user_id', 0);

        $postsQuery = Post::published()
            ->with($this->postRelations())
            ->latest();

        if ($authorId > 0) {
            $postsQuery->where('user_id', $authorId);
        }

        if ($followingOnly) {
            if (!$user) {
                $postsQuery->whereRaw('1 = 0');
            } else {
                $followedIds = UserFollow::where('follower_id', $user->id)->pluck('followed_id');
                $postsQuery->whereIn('user_id', $followedIds);
            }
        }

        $posts = $postsQuery->paginate(15);

        $this->attachViewerReactions($posts->getCollection(), $user);
        $this->attachAuthorFollowState($posts->getCollection(), $user);

        return PostResource::collection($posts);
    }

    public function show(Request $request, $id)
    {
        $post = Post::published()
            ->with($this->postRelations())
            ->findOrFail($id);

        $this->attachViewerReactions(collect([$post]), $request->user());
        $this->attachAuthorFollowState(collect([$post]), $request->user());

        return new PostResource($post);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:standard,review_share',
            'body' => 'nullable|string|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'string',
            'embed_url' => 'nullable|string|max:2048',
            'review_id' => 'required_if:type,review_share|exists:reviews,id',
            'shared_product_id' => 'nullable|exists:products,id',
        ]);

        $user = $request->user();
        $type = $validated['type'];
        $body = $validated['body'] ?? null;
        $images = $validated['images'] ?? [];
        $embedUrl = $validated['embed_url'] ?? null;
        $sharedProductId = $validated['shared_product_id'] ?? null;

        if ($type === 'standard') {
            if (!$body && empty($images) && !$embedUrl && !$sharedProductId) {
                return response()->json([
                    'message' => 'Post content is required',
                ], 422);
            }

            if (!empty($images) && $embedUrl) {
                return response()->json([
                    'message' => 'Cannot add both images and a video',
                ], 422);
            }

            if ($sharedProductId) {
                $sharedProduct = Product::query()
                    ->where('id', $sharedProductId)
                    ->where('seller_id', $user->seller_id)
                    ->where('status', 'active')
                    ->first();

                if (!$sharedProduct) {
                    return response()->json([
                        'message' => 'You can only share active products that belong to you',
                    ], 403);
                }
            }

            $post = DB::transaction(function () use ($user, $body, $images, $embedUrl, $sharedProductId) {
                $post = Post::create([
                    'user_id' => $user->id,
                    'type' => 'standard',
                    'body' => $body,
                    'shared_product_id' => $sharedProductId,
                    'status' => 'published',
                ]);

                foreach ($images as $index => $path) {
                    PostMedia::create([
                        'post_id' => $post->id,
                        'file_path' => $path,
                        'file_url' => asset('storage/' . ltrim($path, '/')),
                        'sort_order' => $index,
                    ]);
                }

                if ($embedUrl) {
                    $embed = EmbedService::resolve($embedUrl);

                    if (!$embed) {
                        throw ValidationException::withMessages([
                            'embed_url' => 'Video URL not supported',
                        ]);
                    }

                    PostEmbed::create([
                        'post_id' => $post->id,
                        'provider' => $embed['provider'],
                        'original_url' => $embed['original_url'],
                        'embed_url' => $embed['embed_url'],
                        'embed_id' => $embed['embed_id'],
                        'thumbnail_url' => $embed['thumbnail_url'],
                    ]);
                }

                return $post;
            });
        } else {
            if (!empty($images) || $embedUrl) {
                return response()->json([
                    'message' => 'Review shares cannot include images or video',
                ], 422);
            }

            $review = Review::with([
                'user',
                'order',
                'product.images',
                'product.category',
                'product.seller.user',
            ])->findOrFail($validated['review_id']);

            if (!$review->product || !$review->product->seller || $review->product->seller->user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only share reviews for your own products',
                ], 403);
            }

            if ($review->status !== 'published') {
                return response()->json([
                    'message' => 'Only published reviews can be shared',
                ], 403);
            }

            $alreadyShared = Post::where('type', 'review_share')
                ->where('shared_review_id', $review->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($alreadyShared) {
                return response()->json([
                    'message' => 'You have already shared this review',
                ], 409);
            }

            $post = Post::create([
                'user_id' => $user->id,
                'type' => 'review_share',
                'body' => $body,
                'shared_review_id' => $review->id,
                'status' => 'published',
            ]);
        }

        $post->load($this->postRelations());
        $post->setAttribute('viewer_reaction', null);

        Log::info('Community post created. Follower notifications skipped.', [
            'post_id' => $post->id,
            'user_id' => $user->id,
            'type' => $post->type,
        ]);

        return (new PostResource($post))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $post = Post::with($this->postRelations())->findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to update this post',
            ], 403);
        }

        $validated = $request->validate([
            'body' => 'nullable|string|max:2000',
        ]);

        $post->update([
            'body' => $validated['body'] ?? null,
        ]);

        $this->attachViewerReactions(collect([$post]), $request->user());

        return new PostResource($post);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $user = $request->user();

        if ($post->user_id !== $user->id && !$this->isAdmin($user)) {
            return response()->json([
                'message' => 'You are not allowed to delete this post',
            ], 403);
        }

        $post->update([
            'status' => 'deleted',
        ]);

        return response()->json([
            'message' => 'Post deleted',
        ]);
    }

    public function hide(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $user = $request->user();

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'You are not allowed to hide this post',
            ], 403);
        }

        if ($post->status === 'hidden') {
            return response()->json([
                'message' => 'Post is already hidden',
            ], 422);
        }

        if ($post->status === 'deleted') {
            return response()->json([
                'message' => 'Deleted posts cannot be hidden',
            ], 422);
        }

        $post->update([
            'status' => 'hidden',
        ]);

        return response()->json([
            'message' => 'Post hidden',
        ]);
    }

    public function adminHiddenPosts(Request $request)
    {
        $user = $request->user();

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'You are not allowed to view hidden posts',
            ], 403);
        }

        $posts = Post::query()
            ->where('status', 'hidden')
            ->with($this->postRelations())
            ->latest('updated_at')
            ->paginate(20);

        return PostResource::collection($posts);
    }

    public function restore(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $user = $request->user();

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'You are not allowed to restore this post',
            ], 403);
        }

        if ($post->status !== 'hidden') {
            return response()->json([
                'message' => 'Only hidden posts can be restored',
            ], 422);
        }

        $post->update([
            'status' => 'published',
        ]);

        return response()->json([
            'message' => 'Post restored',
        ]);
    }

    public function getComments(Request $request, $id)
    {
        Post::published()->findOrFail($id);

        $comments = PostComment::query()
            ->where('post_id', $id)
            ->whereNull('parent_id')
            ->where('status', 'published')
            ->with([
                'author',
                'replies.author',
            ])
            ->withCount([
                'replies' => function ($query) {
                    $query->where('status', 'published');
                },
            ])
            ->latest()
            ->paginate(15);

        return PostCommentResource::collection($comments);
    }

    public function storeComment(Request $request, $id)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:post_comments,id',
        ]);

        $post = Post::published()->findOrFail($id);
        $parentId = $validated['parent_id'] ?? null;

        if ($parentId) {
            $parent = PostComment::findOrFail($parentId);

            if ((int) $parent->post_id !== (int) $post->id) {
                return response()->json([
                    'message' => 'Reply must belong to the same post',
                ], 422);
            }

            if ($parent->parent_id) {
                return response()->json([
                    'message' => 'Replies can only be one level deep',
                ], 422);
            }
        }

        $comment = DB::transaction(function () use ($request, $post, $validated, $parentId) {
            $comment = PostComment::create([
                'post_id' => $post->id,
                'user_id' => $request->user()->id,
                'parent_id' => $parentId,
                'body' => $validated['body'],
                'status' => 'published',
            ]);

            $post->increment('comments_count');

            return $comment;
        });

        $comment->load(['author', 'replies.author']);

        if ($post->user_id !== $request->user()->id) {
            NotificationService::create(
                $post->user_id,
                'comment',
                "{$request->user()->name} علق على منشورك",
                '/community'
            );
        }

        return new PostCommentResource($comment);
    }

    public function updateComment(Request $request, $commentId)
    {
        $comment = PostComment::findOrFail($commentId);
        $user = $request->user();

        if ($comment->user_id !== $user->id && !$this->isAdmin($user)) {
            return response()->json([
                'message' => 'You are not allowed to update this comment',
            ], 403);
        }

        if ($comment->status !== 'published') {
            return response()->json([
                'message' => 'Only published comments can be updated',
            ], 422);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $comment->update([
            'body' => $validated['body'],
        ]);

        $comment->load(['author', 'replies.author'])->loadCount([
            'replies' => function ($query) {
                $query->where('status', 'published');
            },
        ]);

        return new PostCommentResource($comment);
    }

    public function destroyComment(Request $request, $commentId)
    {
        $comment = PostComment::findOrFail($commentId);
        $user = $request->user();

        if ($comment->user_id !== $user->id && !$this->isAdmin($user)) {
            return response()->json([
                'message' => 'You are not allowed to delete this comment',
            ], 403);
        }

        $deletedCount = DB::transaction(function () use ($comment) {
            if ($comment->status === 'hidden') {
                return 0;
            }

            $replyIds = PostComment::query()
                ->where('parent_id', $comment->id)
                ->where('status', 'published')
                ->pluck('id');

            $deletedCount = 1 + $replyIds->count();

            if ($replyIds->isNotEmpty()) {
                PostComment::query()
                    ->whereIn('id', $replyIds)
                    ->update([
                        'status' => 'hidden',
                    ]);
            }

            $comment->update([
                'status' => 'hidden',
            ]);

            $post = Post::find($comment->post_id);

            if ($post && $post->comments_count > 0) {
                $post->decrement('comments_count', min($deletedCount, $post->comments_count));
            }

            return $deletedCount;
        });

        return response()->json([
            'message' => 'Comment deleted',
            'deleted_count' => $deletedCount,
        ]);
    }

    public function toggleReaction(Request $request, $id)
    {
        $validated = $request->validate([
            'reaction_type' => 'nullable|string|in:like,love,haha,sad,angry',
        ]);

        $reactionType = $validated['reaction_type'] ?? 'like';
        $post = Post::published()->findOrFail($id);
        $user = $request->user();

        $response = DB::transaction(function () use ($post, $user, $reactionType) {
            $existingReaction = PostReaction::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingReaction) {
                $existingReaction->delete();

                if ($post->reactions_count > 0) {
                    $post->decrement('reactions_count');
                }

                $post->refresh();

                return [
                    'reacted' => false,
                    'count' => $post->reactions_count,
                ];
            }

            PostReaction::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'reaction_type' => $reactionType,
            ]);

            $post->increment('reactions_count');
            $post->refresh();

            return [
                'reacted' => true,
                'reaction_type' => $reactionType,
                'count' => $post->reactions_count,
            ];
        });

        return response()->json($response);
    }

    public function getSellerSharableReviews(Request $request)
    {
        $user = $request->user();

        if ($user->active_role !== 'seller' && !$user->is_seller) {
            return response()->json([
                'message' => 'Seller access is required',
            ], 403);
        }

        $seller = $user->seller;

        if (!$seller) {
            return response()->json([
                'message' => 'Seller profile not found',
            ], 404);
        }

        $sharedReviewIds = Post::where('type', 'review_share')
            ->where('user_id', $user->id)
            ->whereNotNull('shared_review_id')
            ->pluck('shared_review_id');

        $includeShared = $request->boolean('include_shared', false);

        $reviews = Review::query()
            ->where('status', 'published')
            ->whereHas('product', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->when(!$includeShared, function ($query) use ($sharedReviewIds) {
                $query->whereNotIn('id', $sharedReviewIds);
            })
            ->with([
                'user',
                'order',
                'product.images',
                'product.category',
                'product.seller.user',
            ])
            ->latest()
            ->get()
            ->map(function ($review) use ($sharedReviewIds, $request) {
                $data = (new ReviewResource($review))->resolve($request);
                $data['already_shared'] = $sharedReviewIds->contains($review->id);

                return $data;
            })
            ->values();

        return response()->json([
            'data' => $reviews,
        ]);
    }

    public function getSellerSharableProducts(Request $request)
    {
        $user = $request->user();

        if ($user->active_role !== 'seller' && !$user->is_seller) {
            return response()->json([
                'message' => 'Seller access is required',
            ], 403);
        }

        $seller = $user->seller;

        if (!$seller) {
            return response()->json([
                'message' => 'Seller profile not found',
            ], 404);
        }

        $products = Product::query()
            ->where('seller_id', $seller->id)
            ->where('status', 'active')
            ->with(['images', 'category'])
            ->latest()
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'name' => $product->title,
                    'price' => $product->price,
                    'type' => $product->type,
                    'status' => $product->status,
                    'image' => optional($product->images->first())->image_url,
                    'category_name' => optional($product->category)->name,
                ];
            })
            ->values();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function followAuthor(Request $request, $id)
    {
        $user = $request->user();
        $authorId = (int) $id;
        User::findOrFail($authorId);

        if ($user->id === $authorId) {
            return response()->json([
                'message' => 'You cannot follow yourself',
            ], 422);
        }

        UserFollow::firstOrCreate([
            'follower_id' => $user->id,
            'followed_id' => $authorId,
        ]);

        return response()->json([
            'following' => true,
        ]);
    }

    public function unfollowAuthor(Request $request, $id)
    {
        $user = $request->user();
        $authorId = (int) $id;
        User::findOrFail($authorId);

        UserFollow::where('follower_id', $user->id)
            ->where('followed_id', $authorId)
            ->delete();

        return response()->json([
            'following' => false,
        ]);
    }

    public function followers(Request $request, $id)
    {
        $targetUser = User::findOrFail((int) $id);

        $followers = User::query()
            ->select('users.*')
            ->join('user_follows', 'user_follows.follower_id', '=', 'users.id')
            ->where('user_follows.followed_id', $targetUser->id)
            ->orderByDesc('user_follows.created_at')
            ->paginate(20);

        return response()->json($this->buildFollowListResponse($followers, $request->user()));
    }

    public function following(Request $request, $id)
    {
        $targetUser = User::findOrFail((int) $id);

        $following = User::query()
            ->select('users.*')
            ->join('user_follows', 'user_follows.followed_id', '=', 'users.id')
            ->where('user_follows.follower_id', $targetUser->id)
            ->orderByDesc('user_follows.created_at')
            ->paginate(20);

        return response()->json($this->buildFollowListResponse($following, $request->user()));
    }

    private function postRelations(): array
    {
        return [
            'author.seller',
            'media',
            'embed',
            'sharedReview.user',
            'sharedReview.order',
            'sharedReview.product.images',
            'sharedReview.product.category',
            'sharedReview.product.seller.user',
            'sharedProduct.images',
            'sharedProduct.category',
            'sharedProduct.seller.user',
        ];
    }

    private function attachViewerReactions($posts, $user): void
    {
        foreach ($posts as $post) {
            $post->setAttribute('viewer_reaction', null);
        }

        if (!$user || $posts->isEmpty()) {
            return;
        }

        $reactions = PostReaction::query()
            ->where('user_id', $user->id)
            ->whereIn('post_id', $posts->pluck('id'))
            ->get()
            ->keyBy('post_id');

        foreach ($posts as $post) {
            $post->setAttribute('viewer_reaction', $reactions[$post->id]->reaction_type ?? null);
        }
    }

    private function attachAuthorFollowState($posts, $user): void
    {
        foreach ($posts as $post) {
            $post->setAttribute('author_followed_by_viewer', false);
        }

        if (!$user || $posts->isEmpty()) {
            return;
        }

        $authorIds = $posts->pluck('user_id')->unique()->values();
        $followedAuthorIds = UserFollow::query()
            ->where('follower_id', $user->id)
            ->whereIn('followed_id', $authorIds)
            ->pluck('followed_id')
            ->flip();

        foreach ($posts as $post) {
            $post->setAttribute('author_followed_by_viewer', $followedAuthorIds->has($post->user_id));
        }
    }

    private function isAdmin($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin'], true);
    }

    private function buildFollowListResponse($paginator, $viewer): array
    {
        $users = $paginator->getCollection();
        $users->loadMissing(['seller:id,user_id']);
        $userIds = $users->pluck('id')->all();

        $followedByViewer = [];
        if ($viewer && !empty($userIds)) {
            $followedByViewer = UserFollow::query()
                ->where('follower_id', $viewer->id)
                ->whereIn('followed_id', $userIds)
                ->pluck('followed_id')
                ->flip();
        }

        return [
            'data' => $users->map(function ($user) use ($followedByViewer) {
                return [
                    'id' => $user->id,
                    'seller_id' => optional($user->seller)->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar_url,
                    'bio' => $user->bio,
                    'active_role' => $user->active_role,
                    'followed_by_viewer' => $followedByViewer instanceof \Illuminate\Support\Collection
                        ? $followedByViewer->has($user->id)
                        : false,
                ];
            })->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }
}
