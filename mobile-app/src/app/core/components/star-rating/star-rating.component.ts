import { Component, computed, input } from '@angular/core';

export type StarIcon = 'star' | 'star-half' | 'star-outline';

/**
 * Five-star rating display: full, half and outline stars derived from the
 * numeric rating (e.g. 4.8 -> 4 full + 1 half). Matches the value shown.
 */
@Component({
  selector: 'app-star-rating',
  standalone: false,
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent {
  /** Rating out of 5 (clamped), e.g. 4.8. */
  readonly rating = input.required<number>();
  /** Show the numeric value next to the stars. */
  readonly showValue = input(true);

  readonly stars = computed<StarIcon[]>(() => {
    const value = Math.min(Math.max(this.rating(), 0), 5);
    return Array.from({ length: 5 }, (_, i) => {
      const position = i + 1;
      if (value >= position) return 'star';
      if (value >= position - 0.5) return 'star-half';
      return 'star-outline';
    });
  });
}
