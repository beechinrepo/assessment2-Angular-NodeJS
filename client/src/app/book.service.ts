import { Injectable } from "@angular/core";
import { SearchCriteria, BooksResponse, BookResponse, ReviewResponse } from './models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BookService {
  constructor(private http: HttpClient) { }

  backendApiURL = 'http://localhost:3000/api';
  searchApiURL = `${this.backendApiURL}/search`;
  bookApiURL = `${this.backendApiURL}/book/`;


  getBooks(searchCriteria: SearchCriteria): Promise<BooksResponse> {
    return this.http.get<BooksResponse>(this.searchApiURL + '?terms=' + searchCriteria.terms + '&limit=' + searchCriteria.limit + '&offset=' + searchCriteria.offset)
    .toPromise();
  }

  getBook(bookId: string): Promise<BookResponse> {
    return this.http.get<BookResponse>(this.bookApiURL + bookId).toPromise();
  }

  getReview(bookId: string): Promise<ReviewResponse> {
    return this.http.get<ReviewResponse>(this.bookApiURL + bookId +'/review').toPromise();
  }
}

  // getBooks(searchCriteria: SearchCriteria): Promise<BooksResponse> {
  //   //TODO - for Task 3 and Task 4
  //   return (null);
  // }

  // getBook(bookId: string): Promise<BookResponse> {
  //   //TODO - for Task 5

  //   return (null);
  // }