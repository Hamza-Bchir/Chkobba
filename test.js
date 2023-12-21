let isSelectionEnabled = false;

function toggleSelection() {
  isSelectionEnabled = !isSelectionEnabled;
  const cards = document.querySelectorAll('.card');
  
  if (!isSelectionEnabled) {
    cards.forEach(card => {
      card.classList.remove('selected');
      card.removeEventListener('click', handleCardClick);
    });
  } else {
    cards.forEach(card => {
      card.addEventListener('click', handleCardClick);
    });
  }
}

function handleCardClick(event) {
  const card = event.currentTarget;
  card.classList.toggle('selected');
}

// Enable or disable card selection by calling toggleSelection()

toggleSelection();
