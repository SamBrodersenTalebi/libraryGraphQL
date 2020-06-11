import { gql } from '@apollo/client';

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published
      author {
        name
      }
      id
      genres
    }
  }
`;

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      genres
      published
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $published: Int!
    $name: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      name: $name
      genres: $genres
    ) {
      title
      published
      id
      author {
        name
      }
      genres
    }
  }
`;

export const UPDATE_BIRTH = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      id
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const USER = gql`
  {
    me {
      username
      favoriteGenre
    }
  }
`;
