//const { v1: uuid } = require('uuid');
const { ApolloServer, UserInputError, gql } = require('apollo-server');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Author = require('./models/Author');

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
const MONGODB_URI =
  'mongodb+srv://sam:DBCDBhx4Z0SZHb8T@library-qztyk.mongodb.net/test?retryWrites=true&w=majority';

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

const typeDefs = gql`
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author!]!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int
  }

  type Mutation {
    addBook(
      title: String!
      name: String!
      published: Int
      genres: [String!]!
    ): Book
    editAuthor(name: String, setBornTo: Int): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => {
      //use collection.countDocument to get count number of documents
      console.log(Book.collection.countDocuments());
      return Book.collection.countDocuments();
    },
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      return Book.find({}).populate('author');
      /*
      const { author, genre } = args;
      if (author && genre)
        return books
          .filter((book) => book.author === author)
          .filter((book) => book.genres.includes(genre));
      if (author) return books.filter((book) => book.author === author);
      if (genre) return books.filter((book) => book.genres.includes(genre));
      return books;
      */
    },
    allAuthors: () => Author.find({}),
  },

  Mutation: {
    addBook: async (root, args) => {
      //use find to determine if existing author exists
      let existingAuthor = await Author.findOne({ name: args.name });
      //create new author if one does not exist with the name
      if (!existingAuthor) {
        const newAuthor = new Author({ name: args.name });
        try {
          existingAuthor = await newAuthor.save();
          console.log(existingAuthor._id);
          //create new Book with reference to author by id
          const book = new Book({ ...args, author: existingAuthor._id });
          const savedBook = await book.save();
          console.log(savedBook);
          const bookWithAuthor = await Book.populate(savedBook, {
            path: 'author',
          });
          return bookWithAuthor;
        } catch (error) {
          //wrong arguments
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
    },
    editAuthor: async (root, args) => {
      const { name, setBornTo } = args;
      try {
        //use find one and update to update existing author
        //set the new option to true to return the document after update was applied.
        const updatedAuthor = await findOneAndUpdate(
          { name },
          { born: setBornTo },
          { new: true }
        );
      } catch (error) {
        //wrong arguments
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

/*
      const findAuthor = authors.find((author) => author.name === args.author);

      if (!findAuthor) {
        const newAuthor = {
          name: args.author,
          born: null,
          bookCount: 1,
          id: uuid(),
        };
        authors = authors.concat(newAuthor);
      } else {
        const updatedAuthor = {
          ...findAuthor,
          bookCount: ++findAuthor.bookCount,
        };
        authors = authors.map((a) =>
          a.name !== findAuthor.name ? a : updatedAuthor
        );
      }

      const book = { ...args, id: uuid() };
      books = books.concat(book);
      return book;
      */
