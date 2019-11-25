import { Component, OnInit } from '@angular/core';
import { BookService } from '../book.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewResponse } from '../models';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {

  book_id: null;
  reviewResponse: ReviewResponse = null;

  constructor(private bookSvc: BookService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.book_id = this.activatedRoute.snapshot.params.id;
    console.log('Book Id: ', this.book_id);
    this.bookSvc.getReviews(this.book_id)
      .then(result => {
        console.log('Review response: ', result);
        this.reviewResponse = result;
      })
      .catch(error => {
        const ReviewResponse = error as ReviewResponse;
        alert(`Empty Array: ${ReviewResponse.data}\nMessage: ${ReviewResponse.timestamp}`)
      })
  }

  back() {
    this.router.navigate(['book', this.book_id]);
  }
}
