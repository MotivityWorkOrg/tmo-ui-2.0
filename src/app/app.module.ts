import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {NgModule, ApplicationRef} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {removeNgStyles, createNewHosts, createInputTransfer} from '@angularclass/hmr';
import {RouterModule, PreloadAllModules} from '@angular/router';
import {ENV_PROVIDERS} from './environment';
import {ROUTES} from './app.routes';

// App is our top level component
import {APP_RESOLVER_PROVIDERS} from './app.resolver';
import {AppState, InternalStateType} from './app.service';
import {HomeComponent} from './home';
import {FormHelperService} from './services/form-helper.service';
import {ErrorHandleService} from './services/error-handle.service';
import {AppComponent} from './app.component';

import '../styles/styles.scss';
import '../styles/headings.css';
import '../styles/app.less';
import {HttpService} from './services/http.service';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstrapping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, {useHash: true, preloadingStrategy: PreloadAllModules})
  ],
  // expose our Services and Providers into Angular's dependency injection
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    ErrorHandleService,
    FormHelperService,
    HttpService
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {
  }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    store.state = this.appState._state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  /*public static hmrAfterDestroy(store: StoreType) {
   // display new elements
   store.disposeOldHosts();
   delete store.disposeOldHosts;
   }*/
}
