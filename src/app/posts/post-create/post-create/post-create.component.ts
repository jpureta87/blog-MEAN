import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../../post.model';
import { PostsService } from '../../posts.service';
import { mimeType } from '../mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  editMode: boolean = false;
  editingPost: Post | undefined;
  postId: string = '';
  isLoading = false;
  form!: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  token: any;
  loaderSub = new Subscription();

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loaderSub = this.postsService.loaderData.subscribe((loaderStatus) => {
      this.isLoading = loaderStatus;
    });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });
    if (this.route.snapshot.params['id']) {
      this.editMode = true;
      this.postId = this.route.snapshot.params['id'];
      this.isLoading = true;
      this.postsService.getPostById(this.postId).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.editingPost = response;
          this.form.setValue({
            title: this.editingPost?.title,
            content: this.editingPost?.content,
            image: this.editingPost?.imagePath,
          });
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
    }
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.editMode) {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }

    this.form.reset();
  }

  onImagePick(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.form.patchValue({ image: file });
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy(): void {
    this.loaderSub.unsubscribe();
  }
}
