class Flashcard {
    constructor(question, answer) {
        // Eindeutige ID für jede Karteikarte basierend auf dem Zeitstempel
        this.id = Date.now();
        this.question = question;
        this.answer = answer;
        this.status = null; // Status der letzten Bewertung (correct/incorrect/null)
    }

    // Konvertiert ein Objekt in eine Flashcard-Instanz
    // Wird beim Laden der gespeicherten Karteikarten verwendet
    static fromObject(obj) {
        const card = new Flashcard(obj.question, obj.answer);
        card.id = obj.id;
        card.status = obj.status;
        return card;
    }
}

class FlashcardManager {
    constructor() {
        // Lädt gespeicherte Karteikarten aus dem localStorage
        const savedCards = JSON.parse(localStorage.getItem('flashcards')) || [];
        this.flashcards = savedCards.map(card => Flashcard.fromObject(card));
        this.setupEventListeners();
        this.renderFlashcards();
        this.updateSummary();
    }

    // Initialisiert alle Event-Listener für die Benutzerinteraktion
    setupEventListeners() {
        const form = document.getElementById('flashcard-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createFlashcard();
        });

        document.getElementById('reset-button').addEventListener('click', () => {
            this.resetAllCards();
        });
    }

    // Erstellt eine neue Karteikarte aus den Formulareingaben
    createFlashcard() {
        const question = document.getElementById('question').value.trim();
        const answer = document.getElementById('answer').value.trim();

        if (!question || !answer) return;

        const flashcard = new Flashcard(question, answer);
        this.flashcards.push(flashcard);
        this.saveFlashcards();
        this.renderFlashcards();
        this.updateSummary();

        // Formular zurücksetzen
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
    }

    // Speichert alle Karteikarten im localStorage
    saveFlashcards() {
        localStorage.setItem('flashcards', JSON.stringify(this.flashcards));
    }

    // Rendert alle Karteikarten im DOM
    renderFlashcards() {
        const container = document.getElementById('flashcards-container');
        container.innerHTML = '';

        this.flashcards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'flashcard';
            cardElement.setAttribute('data-id', card.id);
            
            // Fügt Status-Klasse hinzu (correct/incorrect)
            if (card.status) {
                cardElement.classList.add(`flashcard-${card.status}`);
            }
            
            cardElement.innerHTML = `
                <div class="flashcard-content">
                    <div class="flashcard-question">${card.question}</div>
                    <div class="flashcard-answer">${card.answer}</div>
                </div>
                <div class="flashcard-controls">
                    <div class="action-buttons" style="display: none;">
                        <button class="correct" onclick="flashcardManager.rateCard(${card.id}, true)">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="incorrect" onclick="flashcardManager.rateCard(${card.id}, false)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <button class="delete" onclick="flashcardManager.deleteCard(${card.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Event-Listener für das Ein-/Ausblenden der Antwort
            cardElement.addEventListener('click', (e) => {
                // Verhindert Auslösung bei Klick auf Buttons
                if (e.target.closest('.flashcard-controls')) return;
                
                const actionButtons = cardElement.querySelector('.action-buttons');
                if (cardElement.classList.contains('show-answer')) {
                    cardElement.classList.remove('show-answer');
                    actionButtons.style.display = 'none';
                } else {
                    cardElement.classList.add('show-answer');
                    actionButtons.style.display = 'flex';
                }
            });

            container.appendChild(cardElement);
        });
    }

    // Bewertet eine Karteikarte als richtig oder falsch
    rateCard(id, correct) {
        const card = this.flashcards.find(c => c.id === id);
        if (card) {
            card.status = correct ? 'correct' : 'incorrect';
            this.saveFlashcards();
            
            // Aktualisiert den Status der Karteikarte im Document Object Model
            const cardElement = document.querySelector(`.flashcard[data-id="${id}"]`);
            if (cardElement) {
                cardElement.classList.remove('flashcard-correct', 'flashcard-incorrect');
                cardElement.classList.add(`flashcard-${card.status}`);
            }
            
            this.updateSummary();
        }
    }

    // Löscht eine Karteikarte nach Bestätigung
    deleteCard(id) {
        if (confirm('Möchten Sie diese Karteikarte wirklich löschen?')) {
            this.flashcards = this.flashcards.filter(card => card.id !== id);
            this.saveFlashcards();
            this.renderFlashcards();
            this.updateSummary();
        }
    }

    // Setzt den status aller Karteikarten auf null
    resetAllCards() {
        if (confirm('Möchten Sie wirklich alle Bewertungen zurücksetzen?')) {
            this.flashcards.forEach(card => {
                card.status = null;
            });
            this.saveFlashcards();
            this.renderFlashcards();
            this.updateSummary();
        }
    }

    // Aktualisiert die Zusammenfassung (richtig/falsch/gesamt)
    updateSummary() {
        const correctCount = this.flashcards.filter(card => card.status === 'correct').length;
        const incorrectCount = this.flashcards.filter(card => card.status === 'incorrect').length;
        const totalCount = this.flashcards.length;

        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('incorrect-count').textContent = incorrectCount;
        document.getElementById('total-count').textContent = totalCount;
    }
}

// Initialisiert den Karteikarten-Manager
const flashcardManager = new FlashcardManager(); 