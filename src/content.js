const api = (typeof browser !== 'undefined') ? browser : chrome;
console.log("LinkedIn Dislike Button: Initializing with DOM-specific injection");
const dislikeIconUrl = api.runtime.getURL("images/dislike.png");

function showToast(title, body) {
  let toast = document.querySelector('.ldb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'ldb-toast';
    toast.innerHTML = '<div class="ldb-toast-title"></div><div class="ldb-toast-body"></div>';
    document.body.appendChild(toast);
  }
  toast.querySelector('.ldb-toast-title').textContent = title;
  toast.querySelector('.ldb-toast-body').textContent = body;
  requestAnimationFrame(() => toast.classList.add('ldb-toast--visible'));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('ldb-toast--visible');
  }, 5000);
}

function addDislikeButtons() {
  const reactionBars = document.querySelectorAll('div.feed-shared-social-action-bar.feed-shared-social-action-bar--full-width.feed-shared-social-action-bar--has-social-counts');
  if (!reactionBars.length) {
    console.warn('Reaction bar container not found');
    return;
  } else {
    console.log(`${reactionBars.length} reaction bar container(s) found`);
  }
  reactionBars.forEach(bar => {
    if (bar.querySelector('.dislike-button')) return;
    const reactionSpan = bar.querySelector('span.reactions-react-button.feed-shared-social-action-bar__action-button.feed-shared-social-action-bar--new-padding');
    if (!reactionSpan) {
      console.warn('Reaction span not found in container');
      return;
    }
    const dislikeButton = document.createElement('div');
    dislikeButton.className = 'dislike-button';
    dislikeButton.innerHTML = `
      <img src="${dislikeIconUrl}" alt="Dislike" class="dislike-icon" />
      <span class="dislike-label">Dislike</span>
    `;
    dislikeButton.addEventListener('click', function() {
      try {
        const post = bar.closest('.feed-shared-update-v2');
        if (!post) {
          throw new Error('Post container not found');
        } else {
          console.log('Post container found');
        }
        const commentButton = post.querySelector('button.artdeco-button.artdeco-button--muted.artdeco-button--3.artdeco-button--tertiary.ember-view.social-actions-button.comment-button.flex-wrap');
        if (!commentButton){
          throw new Error('Comment button not found');
        } else {
          console.log('Comment button found');
        }
        commentButton.click();
        showToast("Please remember to always be respectful on LinkedIn.", "Personally, respectfully, I do not enjoy this post very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.");
        const dislikeMsg = "Personally, respectfully, I do not enjoy this post very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.";
        let attempts = 0;
        const pollEditor = setInterval(() => {
          const editor = post.querySelector('[contenteditable="true"]');
          if (editor) {
            clearInterval(pollEditor);
            editor.focus();
            editor.innerHTML = '<p>' + dislikeMsg + '</p>';
            editor.dispatchEvent(new InputEvent('input', {bubbles: true}));
          } else if (++attempts > 10) {
            clearInterval(pollEditor);
            console.warn('Comment editor not found after polling');
          }
        }, 300);
      } catch (error) {
        console.error('Dislike action failed:', error);
      }
    });
    reactionSpan.parentNode.insertBefore(dislikeButton, reactionSpan.nextSibling);
  });
}

function addCommentDislikeButtons() {
  const commentBars = document.querySelectorAll('.comments-comment-social-bar, .comments-comment-item__action-group');
  commentBars.forEach(bar => {
    if (bar.querySelector('.dislike-button')) return;
    const dislikeButton = document.createElement('button');
    dislikeButton.className = 'dislike-button dislike-button--comment';
    dislikeButton.innerHTML = `
      <img src="${dislikeIconUrl}" alt="Dislike" class="dislike-icon" />
      <span class="dislike-label">Dislike</span>
    `;
    dislikeButton.addEventListener('click', function() {
      showToast("Please remember to always be respectful on LinkedIn.", "Personally, respectfully, I do not enjoy this comment very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.");
      const comment = bar.closest('.comments-comment-item');
      if (!comment) return;
      const replyBtn = comment.querySelector('button.comments-comment-social-bar__reply-action-button, button[aria-label*="Reply"]');
      if (replyBtn) {
        replyBtn.click();
        const dislikeMsg = "Personally, respectfully, I do not enjoy this comment very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.";
        let attempts = 0;
        const pollEditor = setInterval(() => {
          const editor = comment.querySelector('[contenteditable="true"]');
          if (editor) {
            clearInterval(pollEditor);
            editor.focus();
            editor.innerHTML = '<p>' + dislikeMsg + '</p>';
            editor.dispatchEvent(new InputEvent('input', {bubbles: true}));
          } else if (++attempts > 10) {
            clearInterval(pollEditor);
          }
        }, 300);
      }
    });
    bar.appendChild(dislikeButton);
  });
}

function addArticleDislikeButtons() {
  if (!window.location.pathname.startsWith('/pulse/')) return;
  const articleBars = document.querySelectorAll('.reader-social-bar, .social-actions-bar, .article-social-actions');
  articleBars.forEach(bar => {
    if (bar.querySelector('.dislike-button')) return;
    const dislikeButton = document.createElement('div');
    dislikeButton.className = 'dislike-button';
    dislikeButton.innerHTML = `
      <img src="${dislikeIconUrl}" alt="Dislike" class="dislike-icon" />
      <span class="dislike-label">Dislike</span>
    `;
    dislikeButton.addEventListener('click', function() {
      showToast("Please remember to always be respectful on LinkedIn.", "Personally, respectfully, I do not enjoy this article very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.");
      const commentBtn = bar.querySelector('button[aria-label*="Comment"], button[aria-label*="comment"]');
      if (commentBtn) {
        commentBtn.click();
        const dislikeMsg = "Personally, respectfully, I do not enjoy this article very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.";
        let attempts = 0;
        const pollEditor = setInterval(() => {
          const editor = document.querySelector('[contenteditable="true"]');
          if (editor) {
            clearInterval(pollEditor);
            editor.focus();
            editor.innerHTML = '<p>' + dislikeMsg + '</p>';
            editor.dispatchEvent(new InputEvent('input', {bubbles: true}));
          } else if (++attempts > 10) {
            clearInterval(pollEditor);
          }
        }, 300);
      }
    });
    bar.appendChild(dislikeButton);
  });
}

// ----- Execution -----
addDislikeButtons();
addCommentDislikeButtons();
addArticleDislikeButtons();
let debounceTimer = null;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    addDislikeButtons();
    addCommentDislikeButtons();
    addArticleDislikeButtons();
  }, 200);
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});
