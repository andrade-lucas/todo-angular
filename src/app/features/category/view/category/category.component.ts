import { Component, inject } from '@angular/core';
import { MainListComponent } from '../../components/main-list/main-list.component';
import { ColorsListComponent } from '../../components/colors-list/colors-list.component';
import { CategoryService } from '../../services/category.service';

const COMPONENTS = [MainListComponent, ColorsListComponent];

@Component({
  standalone: true,
  selector: 'app-category',
  imports: [...COMPONENTS],
  template: `
    <div class="flex flex-col justify-between h-full w-full">
      <!-- main-list -->
      <app-main-list />

      <!-- colors-list -->
      <app-colors-list />
    </div>
  `,
  styles: ``
})
export class CategoryComponent {
  private readonly categoryService = inject(CategoryService);
}
