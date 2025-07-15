import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = false;
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  isDarkMode() {
    return this.darkModeSubject.value;
  }

  setDarkMode(isDarkMode: boolean) {
    this.darkMode = isDarkMode;
    this.darkModeSubject.next(isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      // document.documentElement.setAttribute('data-coreui-theme', 'dark');


    } else {
      document.body.classList.remove('dark-theme');
      // document.documentElement.removeAttribute('data-coreui-theme');

    }
  }
}