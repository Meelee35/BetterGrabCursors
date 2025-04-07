let currentElement = null;

// REMEMBER: Use browser.extension.getURL() for the path!
const grabCursor = browser.extension.getURL('cursors/grab1.png');
const grabbingCursor = browser.extension.getURL('cursors/grabbing1.png');

// Cursors are 24x24 so I need to use 12px
const cursorHotspotX = 12;
const cursorHotspotY = 12;  



document.addEventListener('mousemove', (event) => {
		currentElement = event.target; 
});


// Custom css class for cursors
const style = document.createElement('style');
style.innerHTML = `
		.custom-cursor {
				cursor: url(${grabCursor}) ${cursorHotspotX} ${cursorHotspotY}, grab !important;
		}
		
		.custom-cursor:active {
			cursor: url(${grabbingCursor}) ${cursorHotspotX} ${cursorHotspotY}, grabbing !important;
		}

		.custom-cursor-grabbing {
				cursor: url(${grabbingCursor}) ${cursorHotspotX} ${cursorHotspotY}, grabbing !important;
		}
`;
document.head.appendChild(style);

// It seems that the code can't detect the grabbing cursor if the page sets it, so i apply it with code instead
document.addEventListener('mousedown', (event) => {
		if (currentElement && currentElement.classList.contains('custom-cursor')) {
				currentElement.classList.add('custom-cursor-grabbing');
				currentElement.classList.remove('custom-cursor');
		}
});

// Reset grabbing state
document.addEventListener('mouseup', (event) => {
		if (currentElement && currentElement.classList.contains('custom-cursor-grabbing')) {
				currentElement.classList.add('custom-cursor');
				currentElement.classList.remove('custom-cursor-grabbing');
		}
});


// Scan all dom elements to reduce flickering that happens when only using mousemove event, 1 frame of the default cursor is shown before the custom one is applied
async function applyCursorClasses() {
  const elements = document.querySelectorAll('*');
  const batchSize = 20;

  for (let i = 0; i < elements.length; i += batchSize) {
    for (let j = i; j < i + batchSize && j < elements.length; j++) {
      const el = elements[j];
      const computedStyle = window.getComputedStyle(el);
      const cursor = computedStyle.cursor;

      if (cursor === 'grab' && !el.classList.contains('custom-cursor')) {
        el.classList.add('custom-cursor');
      } else if (cursor === 'grabbing' && !el.classList.contains('custom-cursor-grabbing')) {
        el.classList.add('custom-cursor');
      }
    }

    // Allow browser to process other things to avoid lag
    await new Promise(requestAnimationFrame);
  }
}



// Scan the dom every 500ms to account for elements changing
setInterval(() => {
	applyCursorClasses();
} , 500); 


// Check element under cursor every 50ms to detect if the element sets cursor to grab or grabbing (grabbing only seems to work occasionally)
setInterval(() => {
		if (currentElement) {
				const cursor = window.getComputedStyle(currentElement).cursor;

				// Only add the custom cursor class once when hovering over a draggable element
				if (cursor === 'grabbing' && !currentElement.classList.contains('custom-cursor-grabbing')) {
						currentElement.classList.add('custom-cursor-grabbing');
				}
				if (cursor === 'grab' && !currentElement.classList.contains('custom-cursor')) {
						currentElement.classList.add('custom-cursor');
				}
		}
}, 100);
// Originally this was 50ms but the addition of the dom scan means this doesn't have to run as often
