import React, { useState } from 'react';
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS } from '../services/query';
import { useMutation } from '@apollo/client';

const NewBook = ({ show, setError, updateCacheWith }) => {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
    update: (store, response) => {
      updateCacheWith(response.data.addBook);
    },
  });

  if (!show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    //convert string --> integer
    const date = Number(published);
    console.log(date);
    createBook({ variables: { title, name, published: date, genres } });
    console.log('add book...');

    setTitle('');
    setPublished('');
    setName('');
    setGenres([]);
    setGenre('');
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('');
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type='button'>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type='submit'>create book</button>
      </form>
    </div>
  );
};

export default NewBook;
