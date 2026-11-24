// Turns "5" into 5. Returns null for "abc", "1.5", "-3", "0"
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Checks rating + comment for a review. Returns either { error } or { rating, comment }
function validateReviewInput(body) {
  const rating = body.rating;
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return { error: 'Rating must be a whole number from 1 to 10' };
  }
  if (!comment) {
    return { error: 'Comment is required' };
  }
  if (comment.length > 1000) {
    return { error: 'Comment can be at most 1000 characters' };
  }
  return { rating, comment };
}

module.exports = { parseId, validateReviewInput };