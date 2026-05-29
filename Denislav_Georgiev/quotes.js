const defaultQuotes = [
    { text: "Успехът не е краен, провалът не е фатален: важно е мъжеството да продължиш.", author: "Уинстън Чърчил" },
    { text: "Бъдещето принадлежи на тези, които вярват в красотата на своите мечти.", author: "Елинор Рузвелт" },
    { text: "Не се страхувай да се откажеш от доброто, за да отидеш към великото.", author: "Джон Рокфелер" },
    { text: "Начинът да започнеш е да спреш да говориш и да започнеш да правиш.", author: "Уолт Дисни" },
    { text: "Никога не е твърде късно да бъдеш това, което си могъл да бъдеш.", author: "Джордж Елиът" }
];

const newQuoteBtn = document.getElementById('newQuoteBtn');
const currentQuote = document.getElementById('currentQuote');
const quoteAuthor = document.getElementById('quoteAuthor');

newQuoteBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * defaultQuotes.length);
    const quote = defaultQuotes[randomIndex];
    
    currentQuote.textContent = `"${quote.text}"`;
    quoteAuthor.innerHTML = `<cite>— ${quote.author}</cite>`;
});


const quoteForm = document.getElementById('quote-form');
const quoteText = document.getElementById('quoteText');
const quoteAuthorInput = document.getElementById('quoteAuthorInput');
const savedQuotesList = document.getElementById('savedQuotesList');

function renderQuoteToHTML(id, text, author) {
    const li = document.createElement('li');
    
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = `"${text}"`;
    
    const cite = document.createElement('cite');
    cite.textContent = author ? `— ${author}` : "— Неизвестен автор";
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;'; 
    deleteBtn.onclick = () => deleteQuote(id);

    li.appendChild(blockquote);
    li.appendChild(cite);
    li.appendChild(deleteBtn);
    
    savedQuotesList.appendChild(li);
}

function loadSavedQuotes() {
    savedQuotesList.innerHTML = '';
    const savedQuotes = JSON.parse(localStorage.getItem('focusFlowQuotes')) || [];
    
    savedQuotes.forEach(quote => {
        renderQuoteToHTML(quote.id, quote.text, quote.author);
    });
}

quoteForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    const newQuote = {
        id: Date.now(),
        text: quoteText.value.trim(),
        author: quoteAuthorInput.value.trim()
    };
    
    const savedQuotes = JSON.parse(localStorage.getItem('focusFlowQuotes')) || [];
    savedQuotes.push(newQuote);
    localStorage.setItem('focusFlowQuotes', JSON.stringify(savedQuotes));
    
    renderQuoteToHTML(newQuote.id, newQuote.text, newQuote.author);
    
    quoteText.value = '';
    quoteAuthorInput.value = '';
});

function deleteQuote(id) {
    let savedQuotes = JSON.parse(localStorage.getItem('focusFlowQuotes')) || [];
    
    savedQuotes = savedQuotes.filter(quote => quote.id !== id);
    
    localStorage.setItem('focusFlowQuotes', JSON.stringify(savedQuotes));
    
    loadSavedQuotes();
}

loadSavedQuotes();