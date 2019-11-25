import { Injectable } from "@angular/core";
import { SearchCriteria, BooksResponse, BookResponse, ReviewResponse } from './models';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable()
export class BookService {
  constructor(private http: HttpClient) { }

  backendApiURL = '/api';
  searchApiURL = `${this.backendApiURL}/search`;
  bookApiURL = `${this.backendApiURL}/book/`;

  getBooks(searchCriteria: SearchCriteria): Promise<BooksResponse> {
    //TODO - for Task 3 and Task 4
    let params = new HttpParams()
      .set('terms', searchCriteria.terms)

    if (searchCriteria.limit) {
      params = params.append('limit', searchCriteria.limit.toString());
    }
    if (searchCriteria.offset) {
      params = params.append('offset', searchCriteria.offset.toString());
    }

    const headers = new HttpHeaders()
      .set('Accept', 'application/json');

    const url = 'api/search'
    console.log('API Request: ', url);

    return this.http.get<BooksResponse>(url, { headers, params}).toPromise();
  }

  // getBooks(searchCriteria: SearchCriteria): Promise<BooksResponse> {
  //   return this.http.get<BooksResponse>(this.searchApiURL + '?terms=' + searchCriteria.terms + '&limit=' + searchCriteria.limit + '&offset=' + searchCriteria.offset)
  //   .toPromise();
  // }

  getBook(bookId: string): Promise<BookResponse> {
    //TODO - for Task 5
    return this.http.get<BookResponse>(this.bookApiURL + bookId).toPromise();
  }

  getReviews(bookId: string): Promise<ReviewResponse> {
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