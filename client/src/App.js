import React, { useState } from 'react';
import Authors from './components/Authors';
//import Books from './components/Books';
import NewBook from './components/NewBook';
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS } from './services/query';

const App = () => {
  const [page, setPage] = useState('authors');

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <NewBook show={page === 'add'} />
    </div>
  );
};

export default App;

/*
<Authors show={page === 'authors'} />

<Books show={page === 'books'} />
*/
