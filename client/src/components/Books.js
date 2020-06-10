import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../services/query';

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [genre, setGenre] = useState('All genres');

  if (!props.show) {
    return null;
  }

  const uniqueGenres = () => {
    let unique = ['All genres'];
    result.data.allBooks.map((book) => {
      book.genres.map((genre) => {
        //Value exists!
        if (unique.indexOf(genre) !== -1) {
          return false;
        } else {
          //Value does not exists in unique array
          unique.push(genre);
        }
      });
    });
    return unique;
  };

  const showBook = () => {
    let books = [];

    if (genre === 'All genres') {
      //if all genre filter is on then return all books
      return result.data.allBooks;
    }
    result.data.allBooks.map((book) => {
      //if book contains genre then push book to books array
      if (book.genres.includes(genre)) {
        books.push(book);
      }
    });
    return books;
  };

  //if loading is true return loading
  if (result.loading) return <div>loading</div>;

  //const books = [];
  console.log(result);
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {showBook().map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {uniqueGenres().map((b) => (
        <button key={b} onClick={() => setGenre(b)}>
          {b}
        </button>
      ))}
    </div>
  );
};

export default Books;
