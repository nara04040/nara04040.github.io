(function () {
  'use strict';

  let allPosts = [];
  let filteredPosts = [];

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function searchPosts(query) {
    if (!query || query.trim() === '') {
      return allPosts;
    }

    const normalizedQuery = normalizeText(query);
    const queryTerms = normalizedQuery.split(/\s+/).filter((term) => term.length > 0);

    return allPosts.filter((post) => {
      const title = normalizeText(post.title || '');
      const excerpt = normalizeText(post.excerpt || '');
      const tags = (post.tags || []).map((tag) => normalizeText(tag)).join(' ');
      const category = normalizeText(post.category || '');
      const description = normalizeText(post.description || '');

      const searchableText = `${title} ${excerpt} ${tags} ${category} ${description}`;

      return queryTerms.every((term) => searchableText.includes(term));
    });
  }

  function initSearch(posts, renderCallback) {
    allPosts = posts;
    filteredPosts = posts;

    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
      return;
    }

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        filteredPosts = searchPosts(query);
        if (renderCallback) {
          renderCallback(filteredPosts);
        }
      }, 300);
    });
  }

  function getFilteredPosts() {
    return filteredPosts;
  }

  window.searchModule = {
    init: initSearch,
    getFilteredPosts: getFilteredPosts,
  };
})();

