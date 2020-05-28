import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../services/query';

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  if (!props.show) {
    return null;
  }

  //if loading is true return loading
  if (result.loading) return <div>loading</div>;

  //const books = [];

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
