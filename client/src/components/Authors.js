import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { ALL_AUTHORS, UPDATE_BIRTH } from '../services/query';
import Select from 'react-select';

const Authors = (props) => {
  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  //useQuery hook makes ALL_AUTHORS query and saves to result
  const result = useQuery(ALL_AUTHORS);
  const options = [];

  const [changeBirth] = useMutation(UPDATE_BIRTH);

  const update = async (e) => {
    e.preventDefault();
    const birth = Number(born);
    changeBirth({ variables: { name, setBornTo: birth } });
    setName('');
    setBorn('');
  };

  const handleOnChange = (value, { action }) => {
    if (action === 'select-option') {
      // do something
      console.log(value.value);
      setName(value.value);
    }
  };

  //if loading is true return loading
  if (result.loading) {
    return <div>loading</div>;
  } else {
    result.data.allAuthors.map((author) => {
      options.push({ value: author.name, label: author.name });
    });
    console.log(options);
  }

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
      <h3>set birthyear</h3>
      <form onSubmit={update}>
        <div>
          <Select options={options} onChange={handleOnChange} />
        </div>
        <div>
          born{' '}
          <input
            type='text'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>Update</button>
      </form>
    </div>
  );
};

export default Authors;
