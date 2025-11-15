<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Support\Str;

class AIAssistantController extends Controller
{
    private $mistralApiKey;
    private $mistralApiUrl = 'https://api.mistral.ai/v1/chat/completions';
    private $pdfContent = null;

    // Cache TTL in seconds
    private const CACHE_TTL_AI_ANALYSIS = 3600; // 1 hour
    private const CACHE_TTL_PRODUCTS_LIST = 1800; // 30 minutes
    private const CACHE_TTL_SELLERS_LIST = 1800; // 30 minutes
    private const CACHE_TTL_SEARCH_RESULTS = 900; // 15 minutes
    private const CACHE_TTL_CATEGORIES = 3600; // 1 hour

    public function __construct()
    {
        $this->mistralApiKey = env('MISTRAL_API_KEY');
        $this->loadPdfContent();
    }

    private function loadPdfContent()
    {
        try {
            $textPath = storage_path('app/website_scenarios.txt');
            if (file_exists($textPath)) {
                $this->pdfContent = file_get_contents($textPath);
            }
        } catch (\Exception $e) {
            Log::error('Error loading PDF content: ' . $e->getMessage());
        }
    }

    public function chat(Request $request)
    {
        $userMessage = $request->input('message', '');
        $conversationHistory = $request->input('history', []);

        // First message - greeting (allow empty message for initial greeting)
        if (empty($conversationHistory) && (empty($userMessage) || trim($userMessage) === '')) {
            return response()->json([
                'message' => 'مرحباً! أنا ميرنا وسأساعدك في بازار. يمكنك أن تسألني عن أي شيء حول أفضل المنتجات أو الخدمات أو عن بائع معين، وسأكون سعيدة لمساعدتك!',
                'type' => 'text'
            ]);
        }

        // For subsequent messages, require a message
        if (empty($userMessage) || trim($userMessage) === '') {
            return response()->json(['error' => 'Message is required'], 400);
        }

        // Normalize message for cache key
        $normalizedMessage = $this->normalizeMessage($userMessage);
        $cacheKey = 'ai_assistant:analysis:' . md5($normalizedMessage);

        // Try to get cached AI analysis
        $aiAnalysis = Cache::remember($cacheKey, self::CACHE_TTL_AI_ANALYSIS, function () use ($userMessage) {
            return $this->analyzeUserIntentWithAI($userMessage);
        });

        // If cache miss or analysis failed, use fallback
        if (!$aiAnalysis || !isset($aiAnalysis['intent'])) {
            $aiAnalysis = $this->fallbackIntentDetection($userMessage);
        }

        $response = null;
        $products = [];
        $sellers = [];

        // Handle based on AI analysis
        switch ($aiAnalysis['intent']) {
            case 'product_search':
                $searchCacheKey = 'ai_assistant:products:' . md5($aiAnalysis['corrected_query'] ?? $normalizedMessage);
                $products = Cache::remember($searchCacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($aiAnalysis) {
                    return $this->searchProductsWithAI($aiAnalysis);
                });
                $sellers = $this->getSellersForProducts($products);
                $response = $this->generateProductResponse($products, $aiAnalysis);
                break;

            case 'seller_search':
                $searchCacheKey = 'ai_assistant:sellers:' . md5($aiAnalysis['corrected_query'] ?? $normalizedMessage);
                $sellers = Cache::remember($searchCacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($aiAnalysis) {
                    return $this->searchSellersWithAI($aiAnalysis);
                });
                $response = $this->generateSellerResponse($sellers, $aiAnalysis);
                break;

            case 'scenario_question':
                $scenarioCacheKey = 'ai_assistant:scenario:' . md5($normalizedMessage);
                $response = Cache::remember($scenarioCacheKey, self::CACHE_TTL_AI_ANALYSIS, function () use ($userMessage) {
                    return $this->answerScenarioQuestion($userMessage);
                });
                break;

            case 'general_question':
                // Check if it's actually a search query disguised as general question
                // Only search if there are search terms provided
                if (!empty($aiAnalysis['search_terms']) && count($aiAnalysis['search_terms']) > 0) {
                    // Try to search for products
                    $searchCacheKey = 'ai_assistant:products:' . md5($normalizedMessage);
                    $products = Cache::remember($searchCacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($aiAnalysis) {
                        return $this->searchProductsWithAI($aiAnalysis);
                    });
                    
                    if (!empty($products)) {
                        // If products found, treat it as product search
                        $sellers = $this->getSellersForProducts($products);
                        $response = $this->generateProductResponse($products, $aiAnalysis);
                    } else {
                        // If no products, use general AI response
                        $generalCacheKey = 'ai_assistant:general:' . md5($normalizedMessage);
                        $response = Cache::remember($generalCacheKey, self::CACHE_TTL_AI_ANALYSIS, function () use ($userMessage, $conversationHistory) {
                            return $this->getAIResponse($userMessage, $conversationHistory, [], []);
                        });
                    }
                } else {
                    // No search terms - it's truly a general question (greeting, thanks, etc.)
                    // Check if it's a greeting/thanks to use simpler response without products list
                    $isGreeting = $this->isGreetingOrThanks($userMessage);
                    $generalCacheKey = 'ai_assistant:general:' . md5($normalizedMessage);
                    $response = Cache::remember($generalCacheKey, self::CACHE_TTL_AI_ANALYSIS, function () use ($userMessage, $conversationHistory, $isGreeting) {
                        return $this->getAIResponse($userMessage, $conversationHistory, [], [], $isGreeting);
                    });
                }
                break;

            default:
                $response = 'عذراً، لم أفهم سؤالك. يمكنك إعادة صياغته.';
        }

        // Format response
        if (!empty($products) || !empty($sellers)) {
            return response()->json([
                'message' => $response,
                'type' => 'results',
                'products' => $products,
                'sellers' => $sellers,
                'cached' => Cache::has($cacheKey) // For debugging
            ]);
        }

        return response()->json([
            'message' => $response ?: 'عذراً، لم أتمكن من العثور على ما تبحث عنه.',
            'type' => 'text',
            'cached' => Cache::has($cacheKey)
        ]);
    }

    /**
     * Normalize message for better cache hits
     * Removes extra spaces, converts to lowercase, removes diacritics
     */
    private function normalizeMessage($message)
    {
        // Remove extra spaces
        $normalized = preg_replace('/\s+/', ' ', trim($message));
        
        // Convert to lowercase
        $normalized = mb_strtolower($normalized, 'UTF-8');
        
        return $normalized;
    }

    /**
     * Use AI to analyze user intent and extract corrected search terms
     */
    private function analyzeUserIntentWithAI($userMessage)
    {
        // Get cached products/sellers/categories lists
        $availableProducts = $this->getAvailableProductsForAI();
        $availableSellers = $this->getAvailableSellersForAI();
        $availableCategories = $this->getAvailableCategories();

        $systemPrompt = "أنت مساعد ذكي لموقع بازار. مهمتك هي فهم قصد المستخدم حتى لو كان هناك أخطاء إملائية أو كلمات غير واضحة.

⚠️ مهم جداً: يجب عليك البحث فقط في المنتجات والبائعين الموجودين فعلياً في قاعدة بيانات الموقع. لا تقترح منتجات أو بائعين غير موجودين في القائمة أدناه.

⚠️ تحليل الرسائل (مهم جداً):
- إذا كانت الرسالة مجرد تحية أو شكر أو تعليق عام (مثل: شكراً، شكرا، thank you، thanks، مرحبا، hello، hi، السلام، سلام، أهلاً، أهلا، كيفك، كيف حالك، بخير، تمام، ok، okay، ماشي، تمام، حلو، جميل، رائع، عظيم، ممتاز، برافو، bravo، good، nice، great، perfect، awesome) → استخدم intent: 'general_question' بدون search_terms
- إذا كانت الرسالة إهانة أو تعليق سلبي (مثل: غبية، غبي، stupid، idiot، bad، سيء، مش حلو، مش عاجبني) → استخدم intent: 'general_question' بدون search_terms
- إذا كانت الرسالة سؤال عن كيفية استخدام الموقع (مثل: كيف، كيف أستخدم، طريقة، شرح، tutorial، help) → استخدم intent: 'scenario_question'
- إذا كانت الرسالة تحتوي على كلمات بحث (مثل: 'أريد'، 'عاوز'، 'ابحث عن'، 'منتج'، 'شراء'، 'بائع'، 'خدمة'، 'خدمه'، 'عندك'، 'عندي'، 'محتاج'، 'أحتاج') → استخدم intent: 'product_search' أو 'seller_search'
- إذا كانت الرسالة عامة بدون طلب محدد → استخدم intent: 'general_question' بدون search_terms

المنتجات المتاحة في الموقع (فقط هذه المنتجات موجودة):
" . json_encode($availableProducts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

البائعون المتاحون (فقط هؤلاء البائعون موجودون):
" . json_encode($availableSellers, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

التصنيفات المتاحة:
" . json_encode($availableCategories, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

عندما يسأل المستخدم، يجب عليك:
1. تحليل الرسالة أولاً - هل هي طلب بحث أم مجرد محادثة؟
2. فهم القصد الحقيقي حتى لو كان هناك أخطاء إملائية
3. تحديد نوع الطلب: product_search, seller_search, scenario_question, أو general_question
4. استخراج الكلمات المفتاحية الصحيحة للبحث في قاعدة البيانات فقط (فقط إذا كان intent: product_search أو seller_search)
5. تصحيح أي أخطاء إملائية
6. اقتراح كلمات بديلة من المنتجات/البائعين الفعلية الموجودة فقط
7. إذا كانت الرسالة مجرد تحية أو شكر أو تعليق عام → استخدم intent: 'general_question' بدون search_terms (مهم: يجب أن يكون search_terms = [])

⚠️ قواعد مهمة:
- للتحيات والشكر والتعليقات العامة: intent = 'general_question' و search_terms = [] (فارغ تماماً)
- للبحث عن منتجات/بائعين: intent = 'product_search' أو 'seller_search' و search_terms = [كلمات البحث]
- لا تضع search_terms للتحيات والشكر حتى لو كانت تحتوي على كلمات قد تبدو كبحث

أجب بصيغة JSON فقط بهذا الشكل:
{
    \"intent\": \"product_search\" | \"seller_search\" | \"scenario_question\" | \"general_question\",
    \"corrected_query\": \"الكلمات المفتاحية المصححة\" (فقط إذا كان intent: product_search أو seller_search، وإلا \"\"),
    \"original_query\": \"الرسالة الأصلية\",
    \"search_terms\": [\"كلمة1\", \"كلمة2\"] (فقط إذا كان intent: product_search أو seller_search، وإلا [] فارغ تماماً),
    \"suggestions\": [\"اقتراح1\", \"اقتراح2\"] (اختياري - فقط من المنتجات الموجودة),
    \"confidence\": 0.0-1.0
}";

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->mistralApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->mistralApiUrl, [
                'model' => 'mistral-tiny',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage]
                ],
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? '{}';
                
                // Try to extract JSON from response
                $jsonMatch = preg_match('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $content, $matches);
                
                if ($jsonMatch && !empty($matches[0])) {
                    $analysis = json_decode($matches[0], true);
                    if (json_last_error() === JSON_ERROR_NONE && isset($analysis['intent'])) {
                        // Log successful AI analysis for monitoring
                        Log::info('AI Analysis successful', [
                            'intent' => $analysis['intent'],
                            'confidence' => $analysis['confidence'] ?? 0
                        ]);
                        return $analysis;
                    }
                }
            }

            Log::error('AI Analysis failed: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('AI Analysis exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Get available products for AI context (with caching)
     */
    private function getAvailableProductsForAI()
    {
        return Cache::remember('ai_assistant:products_list', self::CACHE_TTL_PRODUCTS_LIST, function () {
            return Product::where('status', 'active')
                ->select('id', 'title', 'description', 'category_id')
                ->with('category:id,name')
                ->limit(100)
                ->get()
                ->map(function($product) {
                    return [
                        'id' => $product->id,
                        'title' => $product->title,
                        'category' => $product->category->name ?? null
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get available sellers for AI context (with caching)
     */
    private function getAvailableSellersForAI()
    {
        return Cache::remember('ai_assistant:sellers_list', self::CACHE_TTL_SELLERS_LIST, function () {
            return Seller::whereHas('user', function($q) {
                    $q->where('status', 'active');
                })
                ->select('id', 'user_id')
                ->with('user:id,name,bio')
                ->limit(50)
                ->get()
                ->map(function($seller) {
                    return [
                        'id' => $seller->id,
                        'name' => $seller->user->name ?? 'Unknown',
                        'bio' => $seller->user->bio ?? null
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get available categories (with caching)
     */
    private function getAvailableCategories()
    {
        return Cache::remember('ai_assistant:categories_list', self::CACHE_TTL_CATEGORIES, function () {
            return \App\Models\Category::select('id', 'name')
                ->get()
                ->toArray();
        });
    }

    /**
     * Search products using AI-corrected terms
     */
    private function searchProductsWithAI($aiAnalysis)
    {
        $searchTerms = $aiAnalysis['search_terms'] ?? [];
        $correctedQuery = $aiAnalysis['corrected_query'] ?? '';
        
        // If no search terms, use corrected query
        if (empty($searchTerms) && !empty($correctedQuery)) {
            $searchTerms = array_filter(explode(' ', trim($correctedQuery)), function($term) {
                return strlen(trim($term)) > 1; // Remove single character terms
            });
        }
        
        if (empty($searchTerms)) {
            return [];
        }
        
        // Build the full search query (all terms together)
        $fullQuery = implode(' ', $searchTerms);
        
        $query = Product::where('status', 'active');
        
        // More specific search: prioritize exact matches
        // Priority order: title > category > description (last priority)
        $query->where(function($q) use ($searchTerms, $fullQuery) {
            // Priority 1: Full query match in title (most relevant)
            $q->where('title', 'like', "%{$fullQuery}%");
            
            // Priority 2: Any single term in title (minimum 2 characters)
            foreach ($searchTerms as $term) {
                $term = trim($term);
                if (empty($term) || strlen($term) < 2) continue;
                $q->orWhere('title', 'like', "%{$term}%");
            }
            
            // Priority 3: Category name matches
            $q->orWhereHas('category', function($catQ) use ($searchTerms, $fullQuery) {
                $catQ->where(function($subCatQ) use ($searchTerms, $fullQuery) {
                    $subCatQ->where('name', 'like', "%{$fullQuery}%");
                    foreach ($searchTerms as $term) {
                        $term = trim($term);
                        if (empty($term) || strlen($term) < 2) continue;
                        $subCatQ->orWhere('name', 'like', "%{$term}%");
                    }
                });
            });
            
            // Priority 4: Description matches (last priority - only if no results from above)
            $q->orWhere('description', 'like', "%{$fullQuery}%");
            foreach ($searchTerms as $term) {
                $term = trim($term);
                if (empty($term) || strlen($term) < 2) continue;
                $q->orWhere('description', 'like', "%{$term}%");
            }
        });

        // Order by relevance: title > category > description (last priority)
        $query->orderByRaw("
            CASE 
                WHEN title LIKE ? THEN 1
                WHEN title LIKE ? THEN 2
                WHEN EXISTS (
                    SELECT 1 FROM categories 
                    WHERE categories.id = products.category_id 
                    AND categories.name LIKE ?
                ) THEN 3
                WHEN description LIKE ? THEN 4
                WHEN description LIKE ? THEN 5
                ELSE 6
            END
        ", [
            "%{$fullQuery}%", 
            "%{$searchTerms[0]}%", 
            "%{$fullQuery}%",
            "%{$fullQuery}%",
            "%{$searchTerms[0]}%"
        ]);

        $products = $query->with(['images', 'category', 'seller.user'])
            ->limit(10)
            ->get();

        // If no results, try fuzzy matching with AI suggestions
        if ($products->isEmpty() && isset($aiAnalysis['suggestions']) && !empty($aiAnalysis['suggestions'])) {
            $fuzzyProducts = $this->fuzzySearchProducts($aiAnalysis['suggestions']);
            if (!empty($fuzzyProducts)) {
                return $fuzzyProducts;
            }
        }

        return $this->formatProducts($products);
    }

    /**
     * Search sellers using AI-corrected terms
     */
    private function searchSellersWithAI($aiAnalysis)
    {
        $searchTerms = $aiAnalysis['search_terms'] ?? [];
        $correctedQuery = $aiAnalysis['corrected_query'] ?? '';
        
        // If no search terms, use corrected query
        if (empty($searchTerms) && !empty($correctedQuery)) {
            $searchTerms = array_filter(explode(' ', trim($correctedQuery)), function($term) {
                return strlen(trim($term)) > 1; // Remove single character terms
            });
        }
        
        if (empty($searchTerms)) {
            return [];
        }
        
        $query = Seller::whereHas('user', function($q) use ($searchTerms) {
            $q->where(function($subQ) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $term = trim($term);
                    if (empty($term)) continue;
                    
                    $subQ->orWhere('name', 'like', "%{$term}%")
                         ->orWhere('bio', 'like', "%{$term}%");
                }
            });
        });

        // Order by relevance: name matches first
        if (!empty($searchTerms)) {
            $query->orderByRaw("
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM users 
                        WHERE users.id = sellers.user_id 
                        AND users.name LIKE ?
                    ) THEN 1
                    ELSE 2
                END
            ", ["%{$searchTerms[0]}%"]);
        }

        $sellers = $query->with('user')
            ->limit(10)
            ->get();

        // If no results, try fuzzy matching
        if ($sellers->isEmpty() && isset($aiAnalysis['suggestions']) && !empty($aiAnalysis['suggestions'])) {
            $fuzzySellers = $this->fuzzySearchSellers($aiAnalysis['suggestions']);
            if (!empty($fuzzySellers)) {
                return $fuzzySellers;
            }
        }

        return $this->formatSellers($sellers);
    }

    /**
     * Fuzzy search with AI suggestions
     */
    private function fuzzySearchProducts($suggestions)
    {
        if (empty($suggestions)) {
            return [];
        }
        
        $query = Product::where('status', 'active');
        
        // More specific fuzzy search: prioritize title and category matches
        $query->where(function($q) use ($suggestions) {
            foreach ($suggestions as $suggestion) {
                $suggestion = trim($suggestion);
                if (empty($suggestion) || strlen($suggestion) < 2) continue;
                
                // Priority: title first, then category (remove seller name search to be more specific)
                $q->orWhere('title', 'like', "%{$suggestion}%")
                  ->orWhereHas('category', function($catQ) use ($suggestion) {
                      $catQ->where('name', 'like', "%{$suggestion}%");
                  });
            }
        });

        // Order by relevance
        if (!empty($suggestions)) {
            $query->orderByRaw("
                CASE 
                    WHEN title LIKE ? THEN 1
                    WHEN description LIKE ? THEN 2
                    ELSE 3
                END
            ", ["%{$suggestions[0]}%", "%{$suggestions[0]}%"]);
        }

        return $this->formatProducts(
            $query->with(['images', 'category', 'seller.user'])
                ->limit(10)
                ->get()
        );
    }

    private function fuzzySearchSellers($suggestions)
    {
        if (empty($suggestions)) {
            return [];
        }
        
        $query = Seller::whereHas('user', function($q) use ($suggestions) {
            $q->where(function($subQ) use ($suggestions) {
                foreach ($suggestions as $suggestion) {
                    $suggestion = trim($suggestion);
                    if (empty($suggestion)) continue;
                    
                    $subQ->orWhere('name', 'like', "%{$suggestion}%")
                         ->orWhere('bio', 'like', "%{$suggestion}%");
                }
            });
        });

        // Order by relevance: name matches first
        if (!empty($suggestions)) {
            $query->orderByRaw("
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM users 
                        WHERE users.id = sellers.user_id 
                        AND users.name LIKE ?
                    ) THEN 1
                    ELSE 2
                END
            ", ["%{$suggestions[0]}%"]);
        }

        return $this->formatSellers(
            $query->with('user')
                ->limit(10)
                ->get()
        );
    }

    /**
     * Format products for response
     */
    private function formatProducts($products)
    {
        // If it's already an array, return as is
        if (is_array($products)) {
            return $products;
        }
        
        // If it's a collection, map it
        if ($products instanceof \Illuminate\Support\Collection) {
            return $products->map(function($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'description' => $product->description,
                    'price' => $product->price,
                    'image' => $product->images->first()?->url ?? null,
                    'category' => $product->category->name ?? null,
                    'seller_name' => $product->seller->user->name ?? null,
                    'seller_id' => $product->seller_id,
                    'rating' => $product->rating ?? 0,
                    'link' => "/gigs/{$product->id}"
                ];
            })->toArray();
        }
        
        // If it's empty or null, return empty array
        return [];
    }

    /**
     * Format sellers for response
     */
    private function formatSellers($sellers)
    {
        // If it's already an array, return as is
        if (is_array($sellers)) {
            return $sellers;
        }
        
        // If it's a collection, map it
        if ($sellers instanceof \Illuminate\Support\Collection) {
            return $sellers->map(function($seller) {
                return [
                    'id' => $seller->id,
                    'name' => $seller->user->name ?? 'Unknown',
                    'rating' => $seller->rating ?? 0,
                    'review_count' => $seller->review_count ?? 0,
                    'avatar' => $seller->user->avatar_url ?? null,
                    'link' => "/sellers/{$seller->id}"
                ];
            })->toArray();
        }
        
        // If it's empty or null, return empty array
        return [];
    }

    /**
     * Get sellers for products
     */
    private function getSellersForProducts($products)
    {
        if (empty($products)) return [];

        $sellerIds = array_unique(array_column($products, 'seller_id'));
        $cacheKey = 'ai_assistant:sellers_for_products:' . md5(implode(',', $sellerIds));
        
        return Cache::remember($cacheKey, self::CACHE_TTL_SEARCH_RESULTS, function () use ($sellerIds) {
            $sellers = Seller::whereIn('id', $sellerIds)
                ->with('user')
                ->get();
            return $this->formatSellers($sellers);
        });
    }

    /**
     * Generate AI response for products
     */
    private function generateProductResponse($products, $aiAnalysis)
    {
        if (empty($products)) {
            $suggestionText = '';
            if (isset($aiAnalysis['suggestions']) && !empty($aiAnalysis['suggestions'])) {
                $suggestionText = ' يمكنك تجربة البحث عن: ' . implode(', ', array_slice($aiAnalysis['suggestions'], 0, 3));
            }
            return 'عذراً، لم أجد منتجات تطابق بحثك في الموقع حالياً.' . $suggestionText . ' أو يمكنك تصفح التصنيفات المتاحة.';
        }

        $count = count($products);
        return "وجدت {$count} منتج" . ($count > 1 ? 'ات' : '') . " في موقعنا تطابق بحثك:";
    }

    /**
     * Generate AI response for sellers
     */
    private function generateSellerResponse($sellers, $aiAnalysis)
    {
        if (empty($sellers)) {
            return 'عذراً، لم أجد بائعين يطابقون بحثك.';
        }

        $count = count($sellers);
        return "وجدت {$count} بائع" . ($count > 1 ? 'ين' : '') . " يطابقون بحثك:";
    }

    /**
     * Answer scenario questions from PDF
     */
    private function answerScenarioQuestion($question)
    {
        if (!$this->pdfContent) {
            return $this->getAIResponse($question, [], [], []);
        }

        $prompt = "بناءً على الوثائق التالية للموقع:\n\n{$this->pdfContent}\n\nسؤال المستخدم: {$question}\n\nأجب بشكل مفيد بالعربية:";

        return $this->callMistralAPI($prompt);
    }

    /**
     * Check if message is a greeting or thanks
     */
    private function isGreetingOrThanks($message)
    {
        $messageLower = mb_strtolower($message, 'UTF-8');
        $greetings = [
            'شكرا', 'شكراً', 'شكر', 'thank you', 'thanks', 'thank', 'thx', 'ty',
            'مرحبا', 'مرحباً', 'مرحبا بك', 'hello', 'hi', 'hey', 'السلام', 'سلام', 'السلام عليكم',
            'أهلاً', 'أهلا', 'أهلا وسهلا', 'welcome',
            'كيفك', 'كيف حالك', 'كيفك انت', 'how are you', 'how are u',
            'بخير', 'تمام', 'ok', 'okay', 'ماشي', 'حلو', 'جميل', 'رائع', 'عظيم', 'ممتاز',
            'برافو', 'bravo', 'good', 'nice', 'great', 'perfect', 'awesome', 'excellent',
            'مشكور', 'مشكورة', 'متشكر', 'متشكرة', 'يعطيك العافية', 'جزاك الله خير',
            'bye', 'مع السلامة', 'وداع', 'باي', 'see you', 'later'
        ];
        
        foreach ($greetings as $greeting) {
            if (strpos($messageLower, $greeting) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get general AI response
     */
    private function getAIResponse($message, $history, $products = [], $sellers = [], $isGreeting = false)
    {
        // For greetings/thanks, use simple prompt without products/sellers list
        if ($isGreeting) {
            $systemPrompt = "أنت ميرنا، مساعد ذكي مفيد لموقع بازار. تساعد المستخدمين في العثور على المنتجات والبائعين والإجابة على أسئلة الموقع.

⚠️ قواعد مهمة جداً:
1. هذه رسالة تحية أو شكر - أجب بردود ودية وطبيعية فقط
2. لا تذكر المنتجات أو البائعين أو قوائم المنتجات
3. لا تذكر قاعدة البيانات أو البحث
4. أجب بشكل مختصر وودي (سطر أو سطرين فقط)
5. دائماً أجب بالعربية

مثال على رد مناسب: 'شكراً لك! أنا هنا لمساعدتك دائماً. إذا احتجت أي شيء، لا تتردد في السؤال!'";
        } else {
            // Get available products and sellers for context (only for non-greeting messages)
            $availableProducts = $this->getAvailableProductsForAI();
            $availableSellers = $this->getAvailableSellersForAI();
            
            $systemPrompt = "أنت ميرنا، مساعد ذكي مفيد لموقع بازار. تساعد المستخدمين في العثور على المنتجات والبائعين والإجابة على أسئلة الموقع.

⚠️ قواعد مهمة جداً:
1. إذا كانت الرسالة مجرد تحية أو شكر أو تعليق عام (مثل: شكراً، مرحباً، كيفك، بخير، تمام، حلو، جميل، رائع) → أجب بردود ودية وطبيعية بدون ذكر المنتجات أو البحث. لا تبحث في قاعدة البيانات.
2. إذا سأل المستخدم عن منتج معين (مثل 'عاوز شموع'، 'أريد شراء'، 'ابحث عن')، يجب أن تقول له أنك ستبحث في قاعدة البيانات وأن النتائج ستظهر له
3. يجب أن تقترح فقط المنتجات والبائعين الموجودين فعلياً في قاعدة بيانات الموقع
4. لا تقترح منتجات أو بائعين غير موجودين (مثل Nike, Adidas, Gucci, إلخ) إلا إذا كانت موجودة في القائمة أدناه
5. إذا لم تجد منتجات مطابقة، قل للمستخدم بصراحة أن المنتج غير متوفر حالياً في الموقع
6. لا تعطي روابط أو تفاصيل منتجات غير موجودة - فقط قل أنك ستبحث أو أن المنتج غير متوفر
7. إذا سأل المستخدم بالإنجليزية، ترجم السؤال للعربية للبحث في قاعدة البيانات
8. إذا سأل بالعربية عن منتج قد يكون مكتوب بالإنجليزية، ابحث بالكلمتين (مثل: عطور/perfume، أحذية/shoes، ملابس/clothes)
9. استخدم الترجمة في البحث لتحسين النتائج


المنتجات المتاحة في الموقع (فقط هذه):
" . json_encode($availableProducts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

البائعون المتاحون (فقط هؤلاء):
" . json_encode($availableSellers, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

دائماً أجب بالعربية. إذا كان السؤال عن منتج، قل ببساطة أنك ستبحث وأن النتائج ستظهر.";
        }

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        if (!empty($products)) {
            $messages[] = ['role' => 'assistant', 'content' => 'المنتجات التي تم العثور عليها: ' . json_encode($products, JSON_UNESCAPED_UNICODE)];
        }

        if (!empty($sellers)) {
            $messages[] = ['role' => 'assistant', 'content' => 'البائعون الذين تم العثور عليهم: ' . json_encode($sellers, JSON_UNESCAPED_UNICODE)];
        }

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['content']
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        return $this->callMistralAPI($messages);
    }

    /**
     * Call Mistral API
     */
    private function callMistralAPI($messages)
    {
        if (!$this->mistralApiKey) {
            return 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.';
        }

        try {
            if (is_string($messages)) {
                $messages = [['role' => 'user', 'content' => $messages]];
            }

            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->mistralApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->mistralApiUrl, [
                'model' => 'mistral-tiny',
                'messages' => $messages,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? 'عذراً، لم أتمكن من الحصول على إجابة.';
            }

            Log::error('Mistral API error: ' . $response->body());
            return 'عذراً، حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي.';
        } catch (\Exception $e) {
            Log::error('Mistral API exception: ' . $e->getMessage());
            return 'عذراً، حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي.';
        }
    }

    /**
     * Fallback intent detection if AI fails
     */
    private function fallbackIntentDetection($message)
    {
        $messageLower = mb_strtolower($message, 'UTF-8');
        
        // Check for greetings, thanks, or negative comments (should be general_question)
        $greetings = [
            'شكرا', 'شكراً', 'شكر', 'thank you', 'thanks', 'thank', 'thx', 'ty',
            'مرحبا', 'مرحباً', 'مرحبا بك', 'hello', 'hi', 'hey', 'السلام', 'سلام', 'السلام عليكم',
            'أهلاً', 'أهلا', 'أهلا وسهلا', 'welcome',
            'كيفك', 'كيف حالك', 'كيفك انت', 'how are you', 'how are u',
            'بخير', 'تمام', 'ok', 'okay', 'ماشي', 'حلو', 'جميل', 'رائع', 'عظيم', 'ممتاز',
            'برافو', 'bravo', 'good', 'nice', 'great', 'perfect', 'awesome', 'excellent',
            'مشكور', 'مشكورة', 'متشكر', 'متشكرة', 'يعطيك العافية', 'جزاك الله خير',
            'bye', 'مع السلامة', 'وداع', 'باي', 'see you', 'later'
        ];
        $negativeComments = ['غبية', 'غبي', 'stupid', 'idiot', 'bad', 'سيء', 'مش حلو', 'مش عاجبني', 'not good', 'terrible'];
        
        $isGreeting = false;
        $isNegative = false;
        
        foreach ($greetings as $greeting) {
            if (strpos($messageLower, $greeting) !== false) {
                $isGreeting = true;
                break;
            }
        }
        
        foreach ($negativeComments as $negative) {
            if (strpos($messageLower, $negative) !== false) {
                $isNegative = true;
                break;
            }
        }
        
        // If it's a greeting or negative comment, return general_question without search
        if ($isGreeting || $isNegative) {
            return [
                'intent' => 'general_question',
                'corrected_query' => $message,
                'search_terms' => [],
                'confidence' => 0.8
            ];
        }
        
        // Check for product search keywords
        $productKeywords = ['منتج', 'شراء', 'أريد', 'عاوز', 'ابحث', 'محتاج', 'أحتاج', 'عندك', 'عندي'];
        foreach ($productKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                return [
                    'intent' => 'product_search',
                    'corrected_query' => $message,
                    'search_terms' => array_filter(explode(' ', $message), function($term) {
                        return strlen(trim($term)) > 1;
                    }),
                    'confidence' => 0.6
                ];
            }
        }

        // Check for seller search keywords
        $sellerKeywords = ['بائع', 'تاجر', 'مقدم خدمة', 'seller'];
        foreach ($sellerKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                return [
                    'intent' => 'seller_search',
                    'corrected_query' => $message,
                    'search_terms' => array_filter(explode(' ', $message), function($term) {
                        return strlen(trim($term)) > 1;
                    }),
                    'confidence' => 0.6
                ];
            }
        }

        // Default to general question
        return [
            'intent' => 'general_question',
            'corrected_query' => $message,
            'search_terms' => [],
            'confidence' => 0.3
        ];
    }

    /**
     * Clear cache when products/sellers are updated
     * Call this from Product/Seller model observers or controllers
     */
    public static function clearCache()
    {
        Cache::forget('ai_assistant:products_list');
        Cache::forget('ai_assistant:sellers_list');
        Cache::forget('ai_assistant:categories_list');
        
        // Clear search result caches (you might want to be more selective)
        // Cache::flush(); // Only if you want to clear everything
    }
}

