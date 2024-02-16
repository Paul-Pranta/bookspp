import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css'; // Import CSS file for styling

Modal.setAppElement('#root');

const App = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, query]); // Fetch books whenever currentPage or query changes

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&title=${encodeURIComponent(query)}&page=${currentPage}&limit=20`
      );
      setBooks(response.data.docs);
      setTotalPages(Math.ceil(response.data.numFound / 20));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when performing a new search
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const openAuthorModal = async (authorName) => {
    try {
      const response = await axios.get(
        `https://openlibrary.org/search.json?author=${encodeURIComponent(authorName)}`
      );
      if (response.data.docs.length > 0) {
        const authorKey = response.data.docs[0].author_key;
        const authorResponse = await axios.get(
          `https://openlibrary.org/authors/${authorKey}.json`
        );
        setSelectedAuthor(authorResponse.data);
        setAuthorModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching author details:', error);
    }
  };

  const closeAuthorModal = () => {
    setSelectedAuthor(null);
    setAuthorModalOpen(false);
  };

  return (
    <div className='main'>
      <h1 style={{ textAlign: 'center' }}>Book Search</h1>
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
        />
        <button onClick={handleSearch}>Go</button>
      </div>
      <div className="grid-container">
        {books.map((book) => (
          <div key={book.key} className="grid-item">
            <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt="Book Cover" />
            <p>Title: {book.title}</p>
            <p>Author: <span onClick={() => openAuthorModal(book.author_name?.[0])} style={{ cursor: 'pointer' }}>{book.author_name?.[0]}</span></p>
          </div>
        ))}
      </div>
      <div>
        {currentPage > 1 && <button onClick={handlePrevPage}>Prev</button>}
        {currentPage < totalPages && <button onClick={handleNextPage}>Next</button>}
      </div>
      <Modal
        isOpen={authorModalOpen}
        onRequestClose={closeAuthorModal}
        contentLabel="Author Details"
      >
        {selectedAuthor && (
          <div>
            <button onClick={closeAuthorModal} style={{ float: 'right' }}>X</button>
            <h2>{selectedAuthor.name}</h2>
            {selectedAuthor?.photos?.[0]?.url && <img src={selectedAuthor.photos[0].url} alt="Author" />}
            <p>{selectedAuthor.bio}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
