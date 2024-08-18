module.exports = (template, book) => {
    let output = template.replace(/{%BOOK_NAME%}/g, book.bookName);
    output = output.replace(/{%AUTHOR_NAME%}/g, book.authorName);
    output = output.replace(/{%GENRE%}/g, book.genre);
    output = output.replace(/{%PUBLICATION_DATE%}/g, book.publicationDate);
    output = output.replace(/{%DESCRIPTION%}/g, book.description);
    output = output.replace(/{%ID%}/g, book.id);

    return output;
}