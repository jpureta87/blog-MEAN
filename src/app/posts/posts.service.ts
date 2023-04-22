import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from './post.model';

const BACKEND_URL = `${environment.apiUrl}/posts`;

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postUpdated = new Subject<{
    posts: Post[];
    postCount: number;
  }>();
  postsData: Observable<{ posts: Post[]; postCount: number }> =
    this.postUpdated.asObservable();
  private loaderStatus = new Subject<boolean>();
  loaderData: Observable<boolean> = this.loaderStatus.asObservable();

  constructor(private httpClient: HttpClient, private router: Router) {}

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.httpClient
      .post<{ message: string; post: Post }>(
        BACKEND_URL,
        postData
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loaderStatus.next(false);
        }
      });
  }

  getPosts(postPerPage: number, currentPage: number) {
    const queryParams = new HttpParams()
      .append('pageSize', postPerPage)
      .append('page', currentPage);
    this.httpClient
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL,
        {
          params: queryParams,
        }
      )
      .pipe(
        map((postData) => {
          const posts = postData.posts.map((post: any) => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator,
            };
          });
          return {
            posts: posts,
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformPostsData) => {
        console.log(transformPostsData);
        this.posts = transformPostsData.posts;
        this.postUpdated.next({
          posts: [...this.posts],
          postCount: transformPostsData.maxPosts,
        });
      });
  }

  deletePost(id: string | null) {
    return this.httpClient.delete(`${BACKEND_URL}/${id}`);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let request: FormData | Post;
    if (typeof image !== 'string') {
      request = new FormData();
      request.append('title', title);
      request.append('content', content);
      request.append('image', image, title);
    } else {
      request = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        //Lo manejamos en el server side
        creator: null,
      };
    }

    this.httpClient
      .put<{ message: string; editedPostId: string }>(
        `${BACKEND_URL}/${id}`,
        request
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log(err)
          this.loaderStatus.next(false);
        }
      });
  }

  getPostById(postId: string): Observable<any> {
    return this.httpClient
      .get<{ message: string; post: any }>(
        `${BACKEND_URL}/${postId}`
      )
      .pipe(
        map((postData: { message: string; post: any }) => {
          return {
            id: postData.post._id,
            title: postData.post.title,
            content: postData.post.content,
            imagePath: postData.post.imagePath,
            creator: postData.post.creator,
          };
        })
      );
  }
}
