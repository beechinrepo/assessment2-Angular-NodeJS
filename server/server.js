//Load the libraries
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const morgan = require('morgan');
const mkQuery = require('./dbutil');
const bodyParser = require('body-parser');
const request = require('request');
const paginate = require('express-paginate');

// Create an instance of the app/server
const app = express();

// Install standard middleware
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: '50mb' }));

// Configuration
const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000; 
const pool = mysql.createPool(require('./config'));

// SQL
const GET_terms = 'select * from book2018 where title like ? or authors like ? limit ? offset ? ';
const GET_book_BY_book_id = 'select * from book2018 where book_id = ?';
const GET_review_BY_book_id = 'select * from book2018 where book_id = ?';
// const GET_games_BY_gid_name = 'select * from game where gid = ? or (name like ? or name like ?) limit 5';
// const COUNT_games = 'select count(*) as game_count from game where gid = ? or (name like ? or name like ?)'; // where name like ?
// const GET_games_BY_gids = 'select * from game where gid between ? and ?';

const getTerms = mkQuery(GET_terms, pool);
const getBookByBookid = mkQuery(GET_book_BY_book_id, pool);
const getReviewByBookid = mkQuery(GET_review_BY_book_id, pool);
// const getGamesByGidName = mkQuery(GET_games_BY_gid_name, pool);
// const countGames = mkQuery(COUNT_games, pool);
// const getGamesByGids = mkQuery(GET_games_BY_gids, pool);

// Define Routes -SQL

app.get('/api/search', 
	(req, res) => {
        const terms = `%${req.query.terms}%`;
		const limit = parseInt(req.query.limit) || 10;
		const offset = parseInt(req.query.offset) || 0;
        console.log(terms, limit, offset);
		getTerms([terms, terms, limit, offset])
			.then(result => {
                console.log(result);
                res.status(200).json({data: result, terms: req.query.terms, timestamp: (new Date()).getTime(),
                    total: result.length, limit: limit, offset: offset});
			})
			.catch(err => {
				res.status(404).json({ message: JSON.stringify(err) });
			})
		}
)

app.get('/api/book/:book_id', 
	(req, res) => {
		const book_id = req.params.book_id;
		console.log(book_id);

		getBookByBookid([book_id])
			.then(result => {
                res.status(200).json({data: result[0], timestamp: (new Date()).getTime()});
			})
			.catch(error => {
				res.status(404).json({ message: JSON.stringify(error) });
			})
	}
);

app.get('/api/book/:book_id/review', (req, res) => {
    const book_id = req.params.book_id;
    console.log(req.params.book_id);

    getReviewByBookid([book_id])
    .then(result => {
        title = result.title
        const options = {
            url: `https://api.nytimes.com/svc/books/v3/reviews.json/api-key=KxL55tjB8BjRrjDo2wDSegAYntHWEp6l?title=${title}`,
        };
        request(options, (error, response, body)=>{
            if (!error && response.statusCode == 200) { 
                res.status(200).json({data: result, timestamp: (new Date()).getTime()});
            };
        });
    })
    .catch(error => {
        res.status(404).json({ message: JSON.stringify(error) });
    })
});

//     (req, resp) => {
//         const q = `%${req.query.q}%` || '';
//         const p1 = countGames([ q ])
//         getGamesByName([ q ])
//             .then(result => {
//                 return Promise.all([ Promise.resolve(result), countGames([ q ])])
//             })
//             .then(results => {
//                 const r0 = results[0];
//                 const r1 = results[1];
//                 console.info('>r1 = ', r1);
//                 resp.status(200).json({
//                     games: r0, 
//                     count: r1[0].game_count
//                 })
//             })
//     }
// )

// (req, res) => { 
//     const options = {
//         url: 'https://api.nytimes.com/svc/books/v3/reviews.json',
//     };
//     request(options, (error, response, body)=>{
//         if (!error && response.statusCode == 200) { 
//             res.status(200).json(JSON.parse(body));
//         };
//     });
// })

// app.get('/api/search/:gid', // param + queries
// 	(req, res) => {
// 		const q = `%${req.query.q}%` || '';
// 		const r = `%${req.query.r}%` || '';
// 		const gid = parseInt((req.params.gid).split('&'));
// 		// console.log(gid,q,r);
// 		const p0 = getGamesByGidName([ gid, q, r ]);  
// 		const p1 = countGames([ gid, q, r ]);
// 		Promise.all([ p0, p1 ])
// 			.then(result => {
// 				const r0 = result[0];
// 				const r1 = result[1];
// 				res.status(200).json({
// 					games: r0,
// 					count: r1[0].game_count
// 				})
// 			})
// 			.catch(error => {
// 				res.status(404).json({ message: JSON.stringify(error) }); 
// 			})
// 	}
// )
// http://localhost:3000/api/search/39953?q=throne&r=game



// app.get('/api/games/:gid', //params range
// 	(req, res) => {
// 		const gid = (req.params.gid).split('-');
//         min = parseInt(gid[0]);
//         max = parseInt(gid[1]);
//         // console.log(min,max)
//         // arr = [];
//         // for (let i=min; i<max; i++) {
//         //     arr.push(i);
//         // }
//         // arr.push(max);
//         // console.log(arr);
// 		getGamesByGids([min, max])
// 			.then(result => {
//                 res.status(200).json(result);
// 			})
// 			.catch(error => {
// 				res.status(404).json({ message: JSON.stringify(error) });
// 			})
// 	}
// );

// Define Routes
// const list = [];
// const API_URL = '/api';

// app.post(`${API_URL}/bitcoin`, (req, res) => {
//     let order = req.body;
//     if (typeof (order) != 'undefined') {
//         order.id = uuidv1();
//         list.push(order);
//         list.sort(function(a, b) {
//             return a.name.localeCompare(b.name);
//          });
//          console.log(list);
//         res.status(200).json(order);
//         // console.log('Posted order: ', order);
//     }
// });

// app.get(`${API_URL}/bitcoin`, (req, res) => {
//     let returnResult = [];
//     list.forEach((item) => {
//         if (item) {
//             returnResult.push(item);
//         }
//     });
//     res.status(200).json(returnResult);
//     // console.log('Getting all transactions: ', returnResult);
//   });

// app.get(`${API_URL}/bitcoin/:orderId`, (req, res) => {
//     let orderId = req.params.orderId;
//     let orderIdx = list.find(x => {   // get value of 1st element
//         if (typeof (x) !== 'undefined') {
//             return x.id == orderId;
//         }
//         return null;
//     });
//     if (orderIdx) {
//         res.status(200).json(orderIdx);
//         // console.log('Received selected order: ', orderIdx);
//     }
// });

// app.delete(`${API_URL}/bitcoin/:orderId`, (req, res) => {
//     const orderId = req.params.orderId;
//     let index = list.findIndex(order => order.id === orderId);
//     if (index < 0) {
//         res.status(404).json({message: 'Order not found'});
//     } else {
//         list.splice(index, 1);
//         res.status(200).json({message: 'Order deleted'});
//     }
// });

// app.put(`${API_URL}/bitcoin`, (req, res) => { // query:sort/filter; param:id specific resource(s)
//     let orderId = req.query.orderId;
//     let order = req.body;
//     const index = list.findIndex(y => {
//         if (typeof (y) !== 'undefined') {
//             return y.id == orderId;
//         }
//         return null;
//     });
//     // console.log(index);
//     if (index === -1) {
//         res.status(500).json({ error: 'error update' })
//     } else {
//         let ordertoUpdate = list[index];
//         ordertoUpdate.name = order.name;
//         ordertoUpdate.contact = order.contact;
//         ordertoUpdate.gender = order.gender;
//         ordertoUpdate.dob = order.dob;
//         ordertoUpdate.orderDate = order.orderDate;
//         ordertoUpdate.orderType = order.orderType;
//         ordertoUpdate.unit = order.unit;
//         ordertoUpdate.btcAddress = order.btcAddress;
//         ordertoUpdate.rate = order.rate;
//         ordertoUpdate.total = order.total;
//         res.status(200).json(ordertoUpdate);
//         // console.log('Updated list: ', ordertoUpdate);
//     };
// });



// JSON.parse() method parses a JSON string to construct a JS obj/value    
// Mistake: put status instead of statusCode

// Serve static files from public folder
// app.use(express.static(__dirname + '/public')); 

// Response 404 in JSON
app.use((req, res) => {
    res.status(404).json({message: `Not found: ${req.originalUrl}`});
    res.status(503).json({message: 'Service is currently not available'});
})

// Start the server
pool.getConnection(
    (err, conn) => {
        // skip error check
        // Start the server
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`);
        });
        if (err) {
            available = false;
            console.info(`\tDB is available: ${available}`);
        } else 
            conn.ping((err) => {
                conn.release();
                available = !err;
                console.info(`\tDB is available: ${available}`);
            })
    }
);
