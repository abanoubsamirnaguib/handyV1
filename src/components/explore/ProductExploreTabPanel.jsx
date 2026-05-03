import React from 'react';
import { motion } from 'framer-motion';
import { Star, Filter, ArrowRight, ListFilter, LayoutGrid, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

/**
 * Shared filters + grid for Explore "products" and "offers" tabs.
 */
export default function ProductExploreTabPanel({
  mode,
  gigsEnabled,
  gigs,
  loading,
  error,
  viewMode,
  setViewMode,
  isFiltersOpen,
  setIsFiltersOpen,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  handleCategoryChange,
  categories,
  selectedType,
  setSelectedType,
  giftSections,
  selectedGiftSection,
  setSelectedGiftSection,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  handleFilterChange,
  resetFilters,
  sortBy,
  handleSortChange,
  hasMore,
  loadMore,
  loadingMore,
  showLoadMoreButton,
  renderGridCard,
  renderListCard,
}) {
  const idSuffix = mode === 'offers' ? '-offers' : '-products';
  const countLabel =
    mode === 'offers'
      ? `منتجات عليها عرض الآن: ${gigs.length}`
      : `تم العثور على ${gigs.length} منتج`;
  const loadingLabel = mode === 'offers' ? 'جاري تحميل العروض...' : 'جاري تحميل المنتجات...';
  const emptyTitle =
    mode === 'offers' ? 'لا توجد عروض تطابق بحثك حالياً' : 'لا توجد منتجات تطابق بحثك';
  const emptyHint =
    mode === 'offers'
      ? 'جرّب تصفية تصنيف آخر أو عد لاحقاً.'
      : 'حاول تعديل الفلاتر أو البحث بكلمات أخرى.';

  return (
    <div className="flex flex-col md:flex-row-reverse gap-8">
      <motion.aside
        className={`md:w-1/4 ${isFiltersOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 bg-white p-6 md:relative md:bg-transparent md:p-0 md:z-auto transition-transform duration-300 ease-in-out transform ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-roman-500/20">
          <CardHeader className="flex flex-row-reverse items-center justify-between">
            <CardTitle className="text-xl text-roman-500 text-right">تصفية النتائج</CardTitle>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-success-100/50 text-roman-500" onClick={() => setIsFiltersOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor={`search-filter${idSuffix}`} className="text-neutral-900 block text-right">بحث بالاسم</Label>
              <Input
                id={`search-filter${idSuffix}`}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="اسم المنتج، وصف..."
                className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right"
                dir="rtl"
              />
            </div>
            <div>
              <Label htmlFor={`category-filter${idSuffix}`} className="text-neutral-900 block text-right">التصنيف</Label>
              <Select value={selectedCategory} onValueChange={(value) => handleCategoryChange(String(value))} dir="rtl">
                <SelectTrigger id={`category-filter${idSuffix}`} className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                  <SelectValue placeholder="اختر تصنيف" />
                </SelectTrigger>
                <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {gigsEnabled && (
              <div>
                <Label htmlFor={`type-filter${idSuffix}`} className="text-neutral-900 block text-right">نوع المنتج</Label>
                <Select value={selectedType} onValueChange={(value) => setSelectedType(String(value))} dir="rtl">
                  <SelectTrigger id={`type-filter${idSuffix}`} className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                    <SelectValue placeholder="اختر نوع المنتج" />
                  </SelectTrigger>
                  <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="product">منتجات جاهزة</SelectItem>
                    <SelectItem value="gig">حرف مخصصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor={`gift-section-filter${idSuffix}`} className="text-neutral-900 block text-right">قسم الهدايا</Label>
              <Select value={selectedGiftSection} onValueChange={(value) => setSelectedGiftSection(String(value))} dir="rtl">
                <SelectTrigger id={`gift-section-filter${idSuffix}`} className="mt-1 border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                  <SelectValue placeholder="اختر قسم الهدايا" />
                </SelectTrigger>
                <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  {giftSections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>{section.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-neutral-900 block text-right">نطاق السعر: {priceRange[0]} - {priceRange[1]} جنيه</Label>
              <Slider
                defaultValue={priceRange}
                min={0}
                max={1000}
                step={50}
                onValueChange={setPriceRange}
                className="mt-2 [&>span:first-child]:h-1 [&>span:first-child]:bg-roman-500/20 [&_[role=slider]]:bg-roman-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-neutral-200"
              />
            </div>
            <div>
              <Label className="text-neutral-900 block text-right">التقييم الأدنى: {minRating} نجوم</Label>
              <div className="flex space-x-1 space-x-reverse mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={minRating >= star ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setMinRating(star === minRating ? 0 : star)}
                    className={`p-2 ${minRating >= star ? 'bg-roman-500 border-roman-500 hover:bg-roman-500/90' : 'border-roman-500/30'}`}
                  >
                    <Star className={`h-5 w-5 ${minRating >= star ? 'text-white' : 'text-warning-500'}`} />
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <Button onClick={handleFilterChange} className="w-full bg-roman-500 hover:bg-roman-500/90 text-white">
              <Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر
            </Button>
            <Button onClick={resetFilters} variant="outline" className="w-full border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white">
              إعادة تعيين الفلاتر
            </Button>
          </CardContent>
        </Card>
      </motion.aside>

      <main className="w-full md:w-3/4">
        <div className="flex items-center justify-end mb-6">
          <p className="text-neutral-900/70 hidden md:block">{countLabel}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="md:hidden ml-2 border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white" onClick={() => setIsFiltersOpen(true)}>
              <Filter className="h-5 w-5" />
            </Button>
            <Select value={sortBy} onValueChange={handleSortChange} dir="rtl">
              <SelectTrigger className="w-[180px] border-roman-500/30 focus:border-roman-500 focus:ring-roman-500/20 text-right">
                <SelectValue placeholder="الترتيب حسب" />
              </SelectTrigger>
              <SelectContent className="border-roman-500/30 text-right" dir="rtl">
                <SelectItem value="oldest">الأقدم</SelectItem>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
                <SelectItem value="rating">الأعلى تقييماً</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="border-roman-500/50 text-roman-500 hover:bg-roman-500 hover:text-white" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ListFilter className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-900">{loadingLabel}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : gigs.length > 0 ? (
          <>
            <motion.div
              className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 rtl' : 'space-y-6'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              dir="rtl"
            >
              {gigs.map((gig, index) => (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? renderGridCard(gig) : renderListCard(gig)}
                </motion.div>
              ))}
            </motion.div>

            {hasMore && (
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: showLoadMoreButton ? 1 : 0.5,
                  y: showLoadMoreButton ? 0 : 20,
                  scale: showLoadMoreButton ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`bg-roman-500 hover:bg-roman-500/90 text-white px-6 py-3 text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 ${showLoadMoreButton ? 'ring-2 ring-roman-500/30' : ''
                    }`}
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
                      تحميل المزيد
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <img src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" alt="لا توجد نتائج" className="mx-auto mb-4 w-48 h-48 text-gray-400" />
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">{emptyTitle}</h3>
            <p className="text-neutral-900/70">{emptyHint}</p>
          </div>
        )}
      </main>
    </div>
  );
}
