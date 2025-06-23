console.log("LinkedIn Dislike Button: Script initialized");

function addDislikeButtons() {
  const posts = document.querySelectorAll('.feed-shared-update-v2');
  if (!posts.length) return;
  
  posts.forEach(post => {
    if (post.querySelector('.dislike-button')) return;
    
    const reactionsContainer = post.querySelector('.social-details-social-actions');
    if (!reactionsContainer) return;
    
    const dislikeButton = document.createElement('div');
    dislikeButton.className = 'dislike-button';
    dislikeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 4H5V18H8V21L12 18H15L19 14V4H15ZM17 12.59L14.59 15H12.41L10 17.41V15H7V6H17V12.59Z" fill="currentColor"/>
      </svg>
      <span>Dislike</span>
    `;
    
    dislikeButton.addEventListener('click', () => {
      try {
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
          } else {
            console.warn('Comment box not found after 300ms');
          }
        }, 300);
      } catch (error) {
        console.error('Dislike button error:', error);
      }
    });
    
    reactionsContainer.appendChild(dislikeButton);
  });
}

// Initial execution
addDislikeButtons();

// MutationObserver with error handling
const observer = new MutationObserver(mutations => {
  try {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        addDislikeButtons();
      }
    });
  } catch (e) {
    console.error('MutationObserver error:', e);
  }
});

try {
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: false,
    characterData: false
  });
} catch (e) {
  console.error('Observer initialization failed:', e);
}