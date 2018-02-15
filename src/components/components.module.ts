import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HeaderComponent } from './header/header';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service';
import { LoginFacebookComponent } from './login-facebook/login-facebook';
import { MediaComponent } from './media/media';
import { FooterComponent } from './footer/footer';
import { PinsComponent } from './pins/pins';

@NgModule({
    declarations: [
        HeaderComponent,
        TermsOfServiceComponent,
        LoginFacebookComponent,
        MediaComponent,
    FooterComponent,
    PinsComponent,
    ],
    imports: [
        IonicModule,
    ],
    exports: [
        HeaderComponent,
        TermsOfServiceComponent,
        LoginFacebookComponent,
        MediaComponent,
    FooterComponent,
    PinsComponent,
    ],
    providers: [
        InAppBrowser
    ]
})
export class ComponentsModule { }
