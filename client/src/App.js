import React, { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import Recommended from './components/Recommended';
import { ALL_BOOKS, USER, BOOK_ADDED } from './services/query';
import { useQuery, useSubscription, useApolloClient } from '@apollo/client';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const client = useApolloClient();
  const user = useQuery(USER);
  const books = useQuery(ALL_BOOKS);

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map((p) => p.id).includes(object.id);

    const dataInStore = client.readQuery({ query: ALL_BOOKS });
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) },
      });
    }
  };

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      //data from subscription
      const addedBook = subscriptionData.data.bookAdded;
      console.log(addedBook);
      //notify client
      window.alert(`${addedBook.title} added`);
      updateCacheWith(addedBook);
    },
  });

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const logout = () => {
    setToken(null);
    //remove token from local storage
    localStorage.clear();
    /*     resetStore resets the cache, 
    which is important because some queries might have fetched data to cache, 
    which only logged in users should have access to. */
    client.resetStore();
  };

  //no token means user is not logged in!
  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify} />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>
        <button onClick={logout}>log out</button>
      </div>
      <Notify errorMessage={errorMessage} />

      <NewBook
        show={page === 'add'}
        updateCacheWith={updateCacheWith}
        setError={notify}
      />

      <Authors show={page === 'authors'} setError={notify} />

      <Books show={page === 'books'} />

      <Recommended show={page === 'recommended'} user={user} books={books} />
    </div>
  );
};

export default App;

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: 'red' }}>{errorMessage}</div>;
};
