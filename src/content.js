console.log("LinkedIn Dislike Button: Initializing with DOM-specific injection");

function addDislikeButtons() {
  const reactionBars = document.querySelectorAll('div.feed-shared-social-action-bar');
  
  if (!reactionBars.length) {
    console.warn('Reaction bar container not found');
    return;
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 4H5V18H8V21L12 18H15L19 14V4H15ZM17 12.59L14.59 15H12.41L10 17.41V15H7V6H17V12.59Z" fill="currentColor"/>
      </svg>
      <span>Dislike</span>
    `;
    dislikeButton.addEventListener('click', function() {
      try {
        const post = bar.closest('.feed-shared-update-v2');
        if (!post) throw new Error('Post container not found');
        const commentButton = post.querySelector('.social-comments-button');
        if (!commentButton) throw new Error('Comment button not found');
        commentButton.click();
        setTimeout(() => {
          const commentBox = post.querySelector('.comments-comment-box__editor');
          if (commentBox) {
            commentBox.focus();
            commentBox.value = "I dislike this";
            const event = new Event('input', { bubbles: true });
            commentBox.dispatchEvent(event);
          }
        }, 300);
      } catch (error) {
        console.error('Dislike action failed:', error);
      }
    });
    reactionSpan.parentNode.insertBefore(dislikeButton, reactionSpan.nextSibling);
  });
}

// ----- Execution -----

addDislikeButtons();
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      addDislikeButtons();
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});