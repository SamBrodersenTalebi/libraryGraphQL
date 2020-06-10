import React, { useState } from 'react';

const Recommended = ({ books, user, show }) => {
  const allBooks = books.loading ? [] : books.data.allBooks;
  const currentUser = user.data.me;
  console.log(currentUser);
  //array with recommended books
  /*   const recommendedBooks = allBooks.filter((book) =>
    book.genres.includes(currentUser.favoriteGenre) 
  );
  */
  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>patterns</strong>
      </p>
      {/*       <table>
        <tbody>
          <tr>
            <th>book</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
};

export default Recommended;
