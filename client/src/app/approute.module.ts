import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './components/search.component';
import { BookListComponent } from './components/book-list.component';
import { BookComponent} from './components/book.component';
import { ReviewComponent } from './components/review.component';

const ROUTES: Routes = [
  { path: '', component: SearchComponent },
  { path: 'books', component: BookListComponent },
  { path: 'book/:book_id', component: BookComponent },
  { path: 'book/:id/review', component: ReviewComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot(ROUTES) ],
  exports: [ RouterModule ]
})
export class AppRouteModule { }
