import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminRequestService } from '../../services/admin-request.service';

@Component({
  selector: 'app-admin-authors',
  templateUrl: './admin-authors.component.html',
  styleUrls: ['./admin-authors.component.sass']
})
export class AdminAuthorsComponent implements OnInit, OnDestroy {
  authors: any[] = [];
  selected: any;
  subs = new Subscription();

  constructor(private request: AdminRequestService) { }

  ngOnInit() { this.refresh(); }
  ngOnDestroy() { this.subs.unsubscribe(); }

  create() {
    this.selected = {
      active: false,
      profile_image: '',
      linkedin_url: '',
      erp_person_uuid: '',
      translations: [{ locale: 'tr', name: '', slug: '', professional_title: '', biography: '', expertise: [] }]
    };
  }

  select(author: any) {
    this.selected = JSON.parse(JSON.stringify(author));
    if (!this.selected.translations.length) {
      this.selected.translations = [{ locale: 'tr', name: '', slug: '', professional_title: '', biography: '', expertise: [] }];
    }
  }

  save(form: NgForm) {
    if (!form.valid) { return; }
    const translation = this.selected.translations[0];
    translation.expertise = typeof translation.expertise === 'string'
      ? translation.expertise.split(',').map(item => item.trim()).filter(item => item)
      : translation.expertise;
    const request = this.selected.id
      ? this.request.putAuthor(this.selected.id, this.selected)
      : this.request.postAuthor(this.selected);
    this.subs.add(request.subscribe(() => this.refresh()));
  }

  remove() {
    if (!this.selected || !this.selected.id) { return; }
    this.subs.add(this.request.deleteAuthor(this.selected.id).subscribe(() => this.refresh()));
  }

  private refresh() {
    this.subs.add(this.request.getAuthors().subscribe(response => {
      this.authors = response;
      this.selected = null;
    }));
  }
}
