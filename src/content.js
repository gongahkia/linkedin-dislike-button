console.log("LinkedIn Dislike Button: Initializing with DOM-specific injection");

window.addEventListener('load', function() {
  const dislikeIconUrl = chrome.runtime.getURL("images/dislike.png");
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
      // dislikeButton.innerHTML = `
      //   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      //     <path d="M15 4H5V18H8V21L12 18H15L19 14V4H15ZM17 12.59L14.59 15H12.41L10 17.41V15H7V6H17V12.59Z" fill="currentColor"/>
      //   </svg>
      //   <span>Dislike</span>
      // `;
      // dislikeButton.innerHTML = `
      //   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
      //       viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      //       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      //       class="dislike-icon" style="display:block;">
      //     <path d="M10 15V19a2 2 0 0 0 2 2h2.72a2 2 0 0 0 2-1.6l1.38-7A2 2 0 0 0 16.13 10H7.34a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2.66z"/>
      //     <path d="M7 10V5a2 2 0 0 1 2-2h3"/>
      //   </svg>
      //   <span class="dislike-label">Dislike</span>
      // `;
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
          alert("Please remember to always be respectful on LinkedIn. Below is a reccomended response.\n\nPersonally, respectfully, I do not enjoy this post very much. However, that's my own opinion, not objective fact, and I recognise that everyone is entitled to their own perspective.");
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
});