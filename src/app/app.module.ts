import {NgModule, ErrorHandler } from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import { HttpModule } from '@angular/http';
import {Sean} from './app.component';
import {BrowserModule} from '@angular/platform-browser';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import { Facebook } from '@ionic-native/facebook';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { Push } from '@ionic-native/push';
import { File } from '@ionic-native/file';
import { IonicStorageModule } from '@ionic/storage';

// start import pages
import {HomePage} from '../pages/home/home';
import {CollaboratePage} from '../pages/collaborate/collaborate';
import {AboutPage} from '../pages/about/about';
import {PortfolioPage} from '../pages/portfolio/portfolio';
import {TeamPage} from '../pages/team/team';
import {LoginPage} from '../pages/login/login';
import {ContactPage} from '../pages/contact/contact';
import {RegisterPage} from '../pages/register/register';
import {PartnersPage} from '../pages/partners/partners';
import {ExplorePage} from '../pages/explore/explore';
import {ForgotPasswordPage} from '../pages/forgot-password/forgot-password';
import {AccountPage} from '../pages/account/account';
import {AccountPicPage} from '../pages/account-pic/account-pic';
import {AccountEmailPage} from '../pages/account-email/account-email';
import {AccountNamePage} from '../pages/account-name/account-name';
import {AccountPasswordPage} from '../pages/account-password/account-password';
import {ContractsPage} from '../pages/contracts/contracts';
import {ProjectsPage} from '../pages/projects/projects';
import {TabsPage} from '../pages/tabs/tabs';
// end import pages

// start import providers
import {UserProvider} from '../providers/user/user';
import {ContentProvider} from '../providers/content/content';
// end import providers

@NgModule({
  declarations: [
    Sean,
    HomePage,    
    CollaboratePage,    
    AboutPage,
    PortfolioPage,
    TeamPage,    
    LoginPage,
    ContactPage,    
    RegisterPage,
    ForgotPasswordPage,
    PartnersPage,    
    ExplorePage,
    AccountPage,
    AccountPicPage,
    AccountEmailPage,    
    AccountNamePage,
    AccountPasswordPage,    
    ContractsPage,
    ProjectsPage,
    TabsPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(Sean, {}, { links: [] }),
    IonicStorageModule.forRoot(),
    HttpModule   
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Sean,
    HomePage,    
    CollaboratePage,    
    AboutPage,
    PortfolioPage,
    TeamPage,    
    LoginPage,
    ContactPage,    
    RegisterPage,
    ForgotPasswordPage,
    PartnersPage,    
    ExplorePage,
    AccountPage,
    AccountPicPage,
    AccountEmailPage,    
    AccountNamePage,
    AccountPasswordPage,    
    ContractsPage,
    ProjectsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UserProvider,
    ContentProvider,  
    Push,
    File,
    Facebook,
    Camera,
    MediaCapture,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
