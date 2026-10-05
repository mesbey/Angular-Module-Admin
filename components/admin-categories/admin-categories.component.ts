import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';

import { AdminRequestService } from '../../services/admin-request.service';
import { CacheService } from '../../imports';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.sass']
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {

  categories: any;

  edit_category: any;

  subs = new Subscription();

  default_category: any = {
    id: null,
    name: null,
    slug: null,
    description: null,
    translations: []
  };

  get isPageReady() {
    return this.categories;
  }

  constructor(
    private adminRequestService: AdminRequestService,
    private cacheService: CacheService
  ) { }

  ngOnInit() {
    const rq1 = this.adminRequestService.getCategories().subscribe(response => this.categories = response);

    this.subs.add(rq1);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  submitForm(f: NgForm) {
    const category = {
      name: f.value.name,
      slug: f.value.slug,
      description: f.value.description,
      translations: [
        {
          locale: 'tr',
          name: f.value.tr_name,
          slug: f.value.tr_slug,
          description: f.value.tr_description,
          published: !!f.value.tr_published
        },
        {
          locale: 'en',
          name: f.value.en_name,
          slug: f.value.en_slug,
          description: f.value.en_description,
          published: !!f.value.en_published
        }
      ].filter(translation => translation.name && translation.slug)
    };

    let rq1;

    if (f.value.id) {

      rq1 = this.adminRequestService.putCategory(f.value.id, category).subscribe(response => this.refreshComponent());
    } else {

      rq1 = this.adminRequestService.postCategory(category).subscribe(response => this.refreshComponent());
    }

    this.subs.add(rq1);
  }

  delete(id: number) {
    const rq4 = this.adminRequestService.deleteCategory(id).subscribe(response => this.refreshComponent());

    this.subs.add(rq4);
  }

  refreshComponent() {
    this.categories = null;

    this.edit_category = null;

    this.cacheService.delete('categories');

    const rq1 = this.adminRequestService.getCategories().subscribe(response => this.categories = response);

    this.subs.add(rq1);
  }

  selectCategory(category: any) {
    this.edit_category = JSON.parse(JSON.stringify(category));
    this.edit_category.translations = this.edit_category.translations || [];
  }

  translation(locale: string): any {
    if (!this.edit_category) { return {}; }
    let translation = this.edit_category.translations.find(item => item.locale === locale);
    if (!translation) {
      translation = { locale, name: '', slug: '', description: '', published: false };
      this.edit_category.translations.push(translation);
    }
    return translation;
  }
}
