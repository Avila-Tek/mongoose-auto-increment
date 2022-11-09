# Mongoose Auto Increment

This repo is based of [chevtek/mongoose-auto-increment](https://github.com/chevtek/mongoose-auto-increment) we take the code update it!

The usage is as simple as this:

```ts
import mongoose from 'mongoose';
import { plugin, initialize } from 'avilatek-mongoose-autoincrement';

initialize(mongoose.createConnection('mongodb://localhost/myDatabase'));

const bookSchema = new mongoose.Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Author' },
  title: String,
  genre: String,
  publishDate: Date,
});

bookSchema.plugin(plugin, 'Book');
const Book = mongoose.model('Book', bookSchema);
```

## Docs

> Under construction

## Credits

- TSDX
- mongoose-auto-increment

## Author

- Jose Roberto Quevedo <jose@avilatek.com>
