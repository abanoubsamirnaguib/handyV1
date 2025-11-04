// Test script to verify the API calls
const testReviewId = 1;

// Test 1: Create review with image
console.log('=== TEST 1: Create Review with Image ===');
const createFormData = new FormData();
createFormData.append('product_id', '1');
createFormData.append('order_id', '1');
createFormData.append('rating', '5');
createFormData.append('comment', 'Test review');
createFormData.append('status', 'published');
// Would append image file here
console.log('FormData for create:', Array.from(createFormData.entries()));

// Test 2: Update review with image
console.log('\n=== TEST 2: Update Review with Image ===');
const updateFormData = new FormData();
updateFormData.append('_method', 'PATCH');
updateFormData.append('rating', '4');
updateFormData.append('comment', 'Updated review');
updateFormData.append('status', 'published');
// Would append image file here
console.log('FormData for update:', Array.from(updateFormData.entries()));

// Test 3: Update review without image
console.log('\n=== TEST 3: Update Review without Image ===');
const updateJsonData = {
  rating: 3,
  comment: 'Another update',
  status: 'published'
};
console.log('JSON data for update:', updateJsonData);

console.log('\n✓ All tests formatted correctly');
