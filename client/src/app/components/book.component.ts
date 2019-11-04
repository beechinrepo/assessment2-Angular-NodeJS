import { Component, OnInit } from '@angular/core';
import { BookService } from '../book.service';
import { SearchCriteria, ErrorResponse, BookResponse, ReviewResponse } from '../models';
import { Router, ActivatedRoute, ParamMap } from '@angular/router'; 
@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: BookResponse = null;
  bookreview: ReviewResponse = null;

  constructor(private bookSvc: BookService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    const selectedId = this.route.snapshot.paramMap.get('book_id');
    this.bookSvc.getBook(selectedId)
    .then(result => {
      this.book = result;
      console.info('Book id: ', selectedId);
      console.log(this.book)
    }).catch(error => {
      const errorResponse = error as ErrorResponse;
      alert(`Status: ${errorResponse.status}\nMessage: ${errorResponse.message}`)
    })
  }

  review(book_id: string) {
    //TODO
    this.bookSvc.getReview(book_id)
    .then(result => {
      this.bookreview = result;
      console.info('Book id: ', book_id);
      console.log(this.bookreview)
    }).catch(error => {
      const errorResponse = error as ErrorResponse;
      alert(`Status: ${errorResponse.status}\nMessage: ${errorResponse.message}`)
    })
    
  }
}
