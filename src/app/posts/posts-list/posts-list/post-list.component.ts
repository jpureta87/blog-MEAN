import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../../post.model';
import { PostsService } from '../../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostsListComponent implements OnInit, OnDestroy {
  posts: Post[] | undefined = [];
  postsSub = new Subscription();
  isLoading = false;
  totalPosts = 0;
  postPerPage = 10;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  isAuthenticated: boolean | undefined;
  isAuthSub = new Subscription();
  userId: string | null = null;

  constructor(
    private postsService: PostsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userId = this.authService.getUserId();
    this.isLoading = true;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.postsSub = this.postsService.postsData.subscribe({
      next: (postsData: { posts: Post[]; postCount: number }) => {
        this.posts = postsData?.posts;
        this.totalPosts = postsData?.postCount;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
    this.isAuthSub = this.authService.tokenData.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.userId = this.authService.getUserId();
    });
  }

  deletePost(post: Post) {
    this.isLoading = true;
    this.postsService.deletePost(post.id).subscribe({
      next: (response) => {
        this.postsService.getPosts(this.postPerPage, this.currentPage);
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.isAuthSub.unsubscribe();
  }

  toEdit(id: string | null) {
    this.router.navigate(['/edit', id]);
  }

  onPageChange(event: PageEvent) {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postPerPage = event.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }
}
