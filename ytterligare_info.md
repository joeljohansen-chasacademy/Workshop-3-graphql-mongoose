# Exempel

**Inline-queries**

```graphql
query {
	books(author: "Ast", genre: "barnbok") {
		id
		title
	}
}
```

```graphql
query Books($author: String, $genre: String) {
	books(author: $author, genre: $genre) {
		id
		title
	}
}
```

```json
{
	"author": "ast",
	"genre": "..."
}
```

**Types**

```javascript
const typeDefs = /* GraphQL */ `
    # Int, Float, Boolean, String, ID
    type Book {

    }
    input CreateBookInput {
        genre: Genre
    }
    input BookFilter {

    }
    enum Genre {
        KUL_DECKARE,
        FANTASY
    }
    type Query {
        books()....
    }
    type Mutation {
        updateBook....
    }
`;
```
