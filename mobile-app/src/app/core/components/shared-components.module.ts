import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular/lazy';

import { StarRatingComponent } from './star-rating/star-rating.component';

/** Small reusable UI pieces shared across the lazy page modules. */
@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [StarRatingComponent],
  exports: [StarRatingComponent],
})
export class SharedComponentsModule {}
