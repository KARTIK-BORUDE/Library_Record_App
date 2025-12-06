document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.needs-validation');



    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!form.checkValidity()) {
            // Validation failed
            return;
        }

        const book = {
            title: document.getElementById('title').value,
            author: document.getElementById('Author').value,
            Assession_Number: document.getElementById('Accession_number').value,
            Purchase_date: document.getElementById('purchase_date').value,
            Cost: document.getElementById('cost').value,
            location: document.getElementById('location').value,
            bill_no: document.getElementById('bill-no').value,
            bill_date: document.getElementById('bill-date').value,
            publisher: document.getElementById('publisher').value,
        }
        console.log(book);

        try {
            const result = await window.excelAPI.AddBook(book);
            if (result.success) {
                alert('Book Added Successfully');
                // Clear form
                form.reset();
                form.classList.remove('was-validated');
            } else {
                alert('Error adding book: ' + result.error);
            }
        } catch (error) {
            console.error("Error adding book:", error);
            alert("An error occurred while adding the book.");
        }
    });

    const purchase_dateInput = document.getElementById("purchase_date");
    if (purchase_dateInput) {
        purchase_dateInput.max = new Date().toISOString().split('T')[0];
    }
});