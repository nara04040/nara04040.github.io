(function () {
  'use strict';

  let allPosts = [];
  let activeTag = null;

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  function renderPostCard(post) {
    const tagsHtml = (post.tags || [])
      .map((tag) => `<span class="post-tag">${escapeHtml(tag)}</span>`)
      .join('');

    return `
      <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card">
        <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
        <div class="post-card-meta">
          <span>${formatDate(post.date)}</span>
          ${post.category ? `<span>${escapeHtml(post.category)}</span>` : ''}
        </div>
        ${post.excerpt ? `<p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        ${tagsHtml ? `<div class="post-card-tags">${tagsHtml}</div>` : ''}
      </a>
    `;
  }

  function renderPosts(posts) {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;

    if (posts.length === 0) {
      postsGrid.innerHTML = '<p class="empty-state">게시글이 없습니다.</p>';
      return;
    }

    postsGrid.innerHTML = posts.map(renderPostCard).join('');
  }

  function extractTags(posts) {
    const tagSet = new Set();
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  function renderTagFilters(tags) {
    const tagFilters = document.getElementById('tagFilters');
    if (!tagFilters) return;

    if (tags.length === 0) {
      tagFilters.innerHTML = '';
      return;
    }

    const filtersHtml = tags
      .map(
        (tag) => `
      <button class="tag-filter ${activeTag === tag ? 'active' : ''}" data-tag="${escapeHtml(tag)}">
        ${escapeHtml(tag)}
      </button>
    `
      )
      .join('');

    tagFilters.innerHTML = filtersHtml;

    tagFilters.querySelectorAll('.tag-filter').forEach((button) => {
      button.addEventListener('click', () => {
        const tag = button.getAttribute('data-tag');
        if (activeTag === tag) {
          activeTag = null;
        } else {
          activeTag = tag;
        }
        filterAndRender();
      });
    });
  }

  function filterPosts(posts) {
    if (!activeTag) {
      return posts;
    }
    return posts.filter((post) => post.tags && post.tags.includes(activeTag));
  }

  function filterAndRender() {
    const filtered = filterPosts(
      window.searchModule ? window.searchModule.getFilteredPosts() : allPosts
    );
    renderPosts(filtered);
    renderTagFilters(extractTags(allPosts));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function loadPosts() {
    fetch('posts.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('게시글을 불러올 수 없습니다.');
        }
        return response.json();
      })
      .then((posts) => {
        allPosts = posts;
        if (window.searchModule) {
          window.searchModule.init(posts, filterAndRender);
        }
        filterAndRender();
      })
      .catch((error) => {
        console.error('Error loading posts:', error);
        const postsGrid = document.getElementById('postsGrid');
        if (postsGrid) {
          postsGrid.innerHTML =
            '<p class="empty-state">게시글을 불러오는 중 오류가 발생했습니다.</p>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosts);
  } else {
    loadPosts();
  }
})();

