/**
 * Mock data for API testing in Exercise 5
 * Used to test success, error, and empty states
 */

export const mockNewsData = {
  success: {
    items: [
      {
        title: 'Test Technology News - Breaking AI Development',
        link: 'https://example.com/tech-news-1',
        description: 'Dies ist ein Test-Artikel über die neuesten KI-Entwicklungen und deren Auswirkungen auf die Tech-Branche',
        pubDate: 'Mon, 01 Jan 2024 10:00:00 GMT',
        category: 'Technology',
        source: 'Test Source',
        snippet: 'Ein kurzer Auszug über KI-Entwicklungen und Machine Learning',
        isoDate: '2024-01-01T10:00:00.000Z'
      },
      {
        title: 'Test Business News - Market Analysis Q4',
        link: 'https://example.com/business-news-1',
        description: 'Ein wichtiger Business-Artikel für Tests über Marktentwicklungen im vierten Quartal',
        pubDate: 'Tue, 02 Jan 2024 14:30:00 GMT',
        category: 'Business',
        source: 'Test Source',
        snippet: 'Marktanalyse zeigt positive Trends für das kommende Jahr',
        isoDate: '2024-01-02T14:30:00.000Z'
      },
      {
        title: 'Test Sports News - Championship Results',
        link: 'https://example.com/sports-news-1',
        description: 'Zusammenfassung der wichtigsten Sportereignisse und Meisterschaftsergebnisse',
        pubDate: 'Wed, 03 Jan 2024 08:15:00 GMT',
        category: 'Sports',
        source: 'Test Source',
        snippet: 'Spannende Wettkämpfe und überraschende Ergebnisse',
        isoDate: '2024-01-03T08:15:00.000Z'
      }
    ]
  },
  empty: {
    items: []
  },
  filtered: {
    items: [
      {
        title: 'Test Technology News - Breaking AI Development',
        link: 'https://example.com/tech-news-1',
        description: 'Dies ist ein Test-Artikel über die neuesten KI-Entwicklungen und deren Auswirkungen auf die Tech-Branche',
        pubDate: 'Mon, 01 Jan 2024 10:00:00 GMT',
        category: 'Technology',
        source: 'Test Source',
        snippet: 'Ein kurzer Auszug über KI-Entwicklungen und Machine Learning',
        isoDate: '2024-01-01T10:00:00.000Z'
      }
    ]
  }
};

export const mockErrorResponse = {
  error: 'Internal Server Error',
  message: 'Failed to fetch news data',
  statusCode: 500
};

export const mockRateLimitResponse = {
  error: 'Rate Limit Exceeded',
  message: 'Too many requests. Please try again later.',
  statusCode: 429,
  retryAfter: 60
};