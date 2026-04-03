# CoinCollect

A coin collection management app built on Node.js, Express, and simple JSON file storage. It allows you to easily track and organize your coin collection, including details like country, denomination, year, and condition. The app also supports image uploads for each coin and provides a user-friendly interface for managing your collection.

**This is a beta version, so expect some rough edges and missing features. Feedback and contributions are welcome!**

## Features

- Add, edit, and delete coins in your collection
- Upload images for each coin (averse and reverse)
- View your collection in a sortable and filterable table
- Export your collection as a JSON file
- Watch statistics about your collection
- Know the total value of your collection based on estimated values
- Simple settings page to manage your collection and database

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/komed3/coincollect.git
cd coincollect

npm install
```

Build the app and start the server:

```bash
npm run build
npm start
```

The app will be running at `http://localhost:3000` or any port specified in the `PORT` environment variable.

## Known Missing Features

- Database import/export functionality
- Deleting coins from the collection
- Mobile responsiveness and improved UI/UX

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.  
(c) 2024 Paul Köhler (komed3). All rights reserved.
