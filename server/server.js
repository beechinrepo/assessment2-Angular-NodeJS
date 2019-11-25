//Load the libraries
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql');
const request = require('request');
const mkQuery = require('./dbutil');

// Configuration
const app = express();
const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000; 
const pool = mysql.createPool(require('./config'));

// Install standard middleware
app.use(cors());
app.use(morgan('tiny'));

// SQL
const GET_book_BY_name_OR_title = 'select * from book2018 where title like ? or authors like ? limit ? offset ?';
const COUNT_books_BY_name_OR_title = 'select count(*) as book_count from book2018 where title like ? or authors like ?';
const GET_book_BY_book_id = 'select * from book2018 where book_id = ?';

const getBookByNameOrTitle = mkQuery(GET_book_BY_name_OR_title, pool);
const countBooksByNameOrTitle = mkQuery(COUNT_books_BY_name_OR_title, pool);
const getBookByBookid = mkQuery(GET_book_BY_book_id, pool);

// Configure Routes
app.get('/api/search', (req, res) => {
    const terms = `%${req.query.terms}%`|| '';
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const p0 = getBookByNameOrTitle([terms, terms, limit, offset]);
    const p1 = countBooksByNameOrTitle([terms, terms]);

    Promise.all([p0, p1])
        .then(results => {
            console.log('results[1]: ', results[1]);
            const data = results[0];
            const countBooks = results[1];
            const books = data.map(v => {
                const authorsArray = v['authors'].split('|');
                const book = {
                    book_id: v['book_id'], // data: BookSummary[] - many books
                    title: v['title'],
                    authors: authorsArray,
                    rating: v['rating']
                }
                return book;
            })
            const bookResponse = {
                data: books,
                terms: req.query.terms,
                timestamp: new Date().getTime(), // reslts[1]: [ RowDataPacket { book_count: 9 } ]
                total: countBooks[0]['book_count'], //countBooks: { book_count: 9 } - get key
                limit: limit,
                offset: offset
            }
            console.log('getBookByNameOrTitle: ', bookResponse);
            res.status(200)
            res.format({
                'default': () => {
                    res.type('application/json')
                        .json(bookResponse)
                }
            })
        })
        .catch(error => {
            const errorResponse = {
                status: 500,
                message: error,
                timestamp: new Date().getTime()
            }
            res.statusCode(500).type('application/json')
                .json(errorResponse);
        })
})
// obj destructuring: 
//Extract properties and assign new name.
// const { name: heroName, weapon: heroWeapon } = hero;
// console.info(heroName);
/* 
    Output: Thor
    Equivalent to:
      let heroName = hero.name
*/
// console.info(heroWeapon);
/* 
    Output: Mjolnir
    Equivalent to:
      let heroWeapon = hero.weapon
*/
app.get('/api/book/:id', (req, res) => {
    const book_id = req.params.id;
    console.log('BookID: ', book_id);
    getBookByBookid([book_id])
        .then(result => {
            const book = result[0];
            book.authors = result[0].authors.split('|')
            book.genres = result[0].genres.split('|')
            console.log('Book: ', book);

            res.status(200).type('application/json')
                .json({
                    data: book,
                    timestamp: new Date().getTime()
                });
        })
        .catch(error => {
            const errorResponse = {
                status: 404,
                message: error,
                timestamp: new Date().getTime()
            }
            res.statusCode(404).type('application/json')
                .json(errorResponse);
        })
})

app.get('/api/book/:id/review', (req, res) => {
    const book_id = req.params.id;

    getBookByBookid([book_id])
        .then(result => {
            const book = result[0];
            book.authors = book.authors.split('|')
            console.log('Book: ', book);

            // NYT Request Option
            const options = {
                url: process.env.API_URL,
                qs: {
                    'title': book.title,
                    'api-key': process.env.API_KEY
                }
            };
            console.log('Options:', options);

            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const results = JSON.parse(body)['results'];
                    const reviews = results.map(v => {
                        const review = {
                            book_id: book.book_id,
                            title: book.title,
                            authors: book.authors,
                            byline: v.byline,
                            summary: v.summary,
                            url: v.url
                        };
                        return review;
                    });

                    res.status(200).type('application/json')
                        .json({
                            data: reviews,
                            timestamp: new Date().getTime()
                        });
                } else {
                    const ReviewResponse = {
                        data: [],
                        timestamp: new Date().getTime()
                    }
                    res.statusCode(500).type('application/json')
                        .json(ReviewResponse);
                }
            })
        })
        .catch(error => {
            const errorResponse = {
                status: 500,
                message: error,
                timestamp: new Date().getTime()
            }
            res.statusCode(500).type('application/json')
                .json(errorResponse);
        })
})

/// Start application
app.listen(PORT, () => {
    console.log(`Application started listening on ${PORT} at ${new Date()}`);
})


// // Response 404 in JSON
// app.use((req, res) => {
//     res.status(404).json({message: `Not found: ${req.originalUrl}`});
//     res.status(503).json({message: 'Service is currently not available'});
// })

// // Start the server
// pool.getConnection(
//     (err, conn) => {
//         // skip error check
//         // Start the server
//         app.listen(PORT, () => {
//             console.info(`Application started on port ${PORT} at ${new Date()}`);
//         });
//         if (err) {
//             available = false;
//             console.info(`\tDB is available: ${available}`);
//         } else 
//             conn.ping((err) => {
//                 conn.release();
//                 available = !err;
//                 console.info(`\tDB is available: ${available}`);
//             })
//     }
// );

// app.get('/api/book/:book_id', 
// 	(req, res) => {
// 		const book_id = req.params.book_id;
// 		console.log(book_id);

// 		getBookByBookid([book_id])
// 			.then(result => {
//                 res.status(200).json({data: result[0], timestamp: (new Date()).getTime()});
// 			})
// 			.catch(error => {
// 				res.status(404).json({ message: JSON.stringify(error) });
// 			})
// 	}
// );

// app.get('/api/book/:book_id/review', (req, res) => {
//     const book_id = req.params.book_id;
//     console.log(req.params.book_id);

//     getReviewByBookid([book_id])
//     .then(result => {
//         title = result[0].title
//         const options = {
//             url: `https://api.nytimes.com/svc/books/v3/reviews.json?api-key=KxL55tjB8BjRrjDo2wDSegAYntHWEp6l&title=${title}`
//         };
//         request(options, (error, response, body)=>{
//             if (!error && response.statusCode == 200) { 
//                 res.status(200).json({data: result, timestamp: (new Date()).getTime()});
//             };
//         });
//     })
//     .catch(error => {
//         res.status(404).json({ message: JSON.stringify(error) });
//     })
// });