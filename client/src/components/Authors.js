import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../services/query';

const Authors = (props) => {
  //useQuery hook makes ALL_AUTHORS query and saves to result
  const result = useQuery(ALL_AUTHORS);

  //if loading is true return loading
  if (result.loading) return <div>loading</div>;

  if (!props.show) {
    return null;
  }
  //const authors = [];

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {/* map over result which can be found in data field */}
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Authors;
