import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PostCreateComponent } from './post-create/post-create/post-create.component';
import { PostsListComponent } from './posts-list/posts-list/post-list.component';
import { AngularMaterialModule } from '../angular-material.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PostCreateComponent, PostsListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule,
  ],
})
export class PostsModule {}
