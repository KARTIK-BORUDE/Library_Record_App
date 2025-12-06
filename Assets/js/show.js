let books;
let allBooks; // Store all books for filtering

async function loadBooks() {
    allBooks = await window.excelAPI.GetAllBooks();
    books = allBooks; // Initially show all books
    displayBooks(books);
}

function displayBooks(booksToDisplay) {
    const tbody = document.getElementById('books-body');
    tbody.innerHTML = "";

    if (booksToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="18" class="text-center">No books found</td></tr>';
        return;
    }

    booksToDisplay.forEach(b => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.Assession_Number}</td>
            <td>${b.publisher}</td>

            <td>${b.Purchase_date}</td>
           
            <td>${b.Cost}</td>
            <td>${b.location}</td>
          
            <td>${b.bill_no}</td>
            <td>${b.bill_date}</td>

            <td><button class="delete-btn btn btn-secondary" ac_id="${b.Assession_Number}">Delete</button></td>
        `;

        tbody.appendChild(row);
    });

    attachDeleteEvents();
}

function attachDeleteEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const ac_id = btn.getAttribute("ac_id");
            await window.excelAPI.DeleteBook(ac_id);
            loadBooks();  // Refresh table after delete
        });
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            displayBooks(allBooks);
            return;
        }

        const filteredBooks = allBooks.filter(book => {
            return (
                book.title?.toLowerCase().includes(searchTerm) ||
                book.author?.toLowerCase().includes(searchTerm) ||
                book.Assession_Number?.toString().toLowerCase().includes(searchTerm) ||
                book.publisher?.toLowerCase().includes(searchTerm) ||
                book.category?.toLowerCase().includes(searchTerm) ||
                book.location?.toLowerCase().includes(searchTerm) ||
                book.edition?.toString().toLowerCase().includes(searchTerm) ||
                book.Copies?.toString().toLowerCase().includes(searchTerm) ||
                book.Language_code?.toLowerCase().includes(searchTerm) ||
                book.Publicatio_year?.toString().toLowerCase().includes(searchTerm) ||
                book.Purchase_date?.toLowerCase().includes(searchTerm) ||
                book.Pages?.toString().toLowerCase().includes(searchTerm) ||
                book.Cost?.toString().toLowerCase().includes(searchTerm) ||
                book.vendor?.toLowerCase().includes(searchTerm) ||
                book.bill_no?.toString().toLowerCase().includes(searchTerm) ||
                book.bill_date?.toLowerCase().includes(searchTerm)

            );
        });

        displayBooks(filteredBooks);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    setupSearch();
});
