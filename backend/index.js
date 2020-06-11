//const { v1: uuid } = require('uuid');
const {
  ApolloServer,
  UserInputError,
  gql,
  AuthenticationError,
} = require('apollo-server');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Author = require('./models/Author');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const { PubSub } = require('apollo-server');
const pubsub = new PubSub();

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

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY';

/* The query me returns the currently logged in user.
New users are created with the createUser mutation, 
and logging in happens with login -mutation. */
const typeDefs = gql`
  type Subscription {
    bookAdded: Book!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author!]!
    me: User
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
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
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
      if (args.author && args.genre) {
      } else {
        if (args.author) {
        }
        if (args.genre) {
          //The $in operator is used to select those documents where the value of the field is equal to any of the given value in the array
          return Book.find({ genres: { $in: [args.genre] } });
        }
      }
      return Book.find({}).populate('author');
    },
    allAuthors: () => Author.find({}),
    //returns current logged in user
    me: (root, args, context) => {
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async (root) => {
      /*       console.log(root);
      const author = await Author.findOne({ name: root.name }).select('_id');
      return Book.find({ author }).countDocuments(); */
      return root.books.length;
    },
  },

  Mutation: {
    createUser: (root, args) => {
      //create user and pass in username and favoriteGenre
      const user = new User({ ...args });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      //hardcoded password, checks if user and password is valid
      if (!user || args.password !== 'secret12') {
        throw new UserInputError('wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      //returns a jwt token
      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }
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
          /* Adding a new book publishes a notification about operation with PubSub method publish */
          pubsub.publish('BOOK_ADDED', { bookAdded: bookWithAuthor });
          return bookWithAuthor;
        } catch (error) {
          //wrong arguments
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      } else {
        //existing author exists
        try {
          const book = new Book({ ...args, author: existingAuthor._id });
          const savedBook = await book.save();
          console.log(savedBook);
          const bookWithAuthor = await Book.populate(savedBook, {
            path: 'author',
          });
          pubsub.publish('BOOK_ADDED', { bookAdded: bookWithAuthor });
          return bookWithAuthor;
        } catch (error) {
          //wrong arguments
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }
      const { name, setBornTo } = args;
      console.log(name, setBornTo);
      try {
        //use find one and update to update existing author
        //set the new option to true to return the document after update was applied.
        const updatedAuthor = await Author.findOneAndUpdate(
          { name },
          { born: setBornTo },
          { new: true }
        );
        console.log(updatedAuthor);
        return updatedAuthor;
      } catch (error) {
        //wrong arguments
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
  },

  Subscription: {
    /* bookAdded subscriptions resolver registers all subscribers by returning iterator object */
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      //return currentUser id
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});
