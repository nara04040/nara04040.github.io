(function () {
  'use strict';

  function parseFrontMatter(content) {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontMatterMatch) {
      return { metadata: {}, content: content };
    }

    const frontMatter = frontMatterMatch[1];
    const postContent = frontMatterMatch[2];
    const metadata = {};

    const lines = frontMatter.split('\n');
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });

    return { metadata, content: postContent };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

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

  function configureMarked() {
    if (typeof marked === 'undefined') {
      console.error('marked.js가 로드되지 않았습니다.');
      return;
    }

    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  function renderPost(metadata, htmlContent) {
    const postArticle = document.getElementById('postArticle');
    if (!postArticle) return;

    const tagsHtml = (metadata.tags || [])
      .map((tag) => `<span class="post-tag">${escapeHtml(tag)}</span>`)
      .join('');

    postArticle.innerHTML = `
      <a href="index.html" class="back-link">← 목록으로</a>
      <header class="post-header">
        <h1 class="post-title">${escapeHtml(metadata.title || '제목 없음')}</h1>
        <div class="post-meta">
          <span>${formatDate(metadata.date)}</span>
          ${metadata.category ? `<span>${escapeHtml(metadata.category)}</span>` : ''}
        </div>
        ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
      </header>
      <div class="post-content">
        ${htmlContent}
      </div>
    `;

    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }

    document.title = `${metadata.title || '게시글'} - 블로그`;
  }

  function loadGiscus() {
    const container = document.getElementById('giscusContainer');
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'nara04040/nara04040.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
  }

  function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('file');

    if (!filename) {
      const postArticle = document.getElementById('postArticle');
      if (postArticle) {
        postArticle.innerHTML =
          '<p class="empty-state">게시글 파일이 지정되지 않았습니다.</p>';
      }
      return;
    }

    const filePath = `pages/${filename}`;

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error('게시글을 불러올 수 없습니다.');
        }
        return response.text();
      })
      .then((content) => {
        configureMarked();
        const { metadata, content: postContent } = parseFrontMatter(content);
        const htmlContent = marked.parse(postContent);
        renderPost(metadata, htmlContent);
        loadGiscus();
      })
      .catch((error) => {
        console.error('Error loading post:', error);
        const postArticle = document.getElementById('postArticle');
        if (postArticle) {
          postArticle.innerHTML =
            '<p class="empty-state">게시글을 불러오는 중 오류가 발생했습니다.</p>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPost);
  } else {
    loadPost();
  }
})();

