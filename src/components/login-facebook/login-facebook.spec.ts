import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { IonicModule, Events, NavController, AlertController, LoadingController, NavParams } from 'ionic-angular';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../environments/environment';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuth, AngularFireAuthModule } from 'angularfire2/auth';
import { Facebook } from '@ionic-native/facebook';

import { LoginFacebookComponent } from './login-facebook';

import { FirebaseProvider } from '../../providers/firebase/firebase';
import { SessionProvider } from '../../providers/session/session';
import { NativeProvider } from '../../providers/native/native';
import { DigitalProvider } from '../../providers/digital/digital';

import { } from 'jasmine';

import {
    FirebaseProviderMock,
    SessionProviderMock,
    NativeProviderMock,
    DigitalProviderMock,
    NavMock,
    StorageMock,
    AngularFireDatabaseMock,
    AngularFireAuthMock,
    LoadingControllerMock,
    AlertControllerMock,
    FacebookMock,
} from '../../../test-config/mocks-ionic';

let fixture;
let component;
let session: SessionProvider;
let sessionSpy;
let firebase: FirebaseProvider;
let firebaseSpy;
let native: NativeProvider;
let nativeSpy;
let digital: DigitalProvider;
let digitalSpy;

describe('LoginFacebookComponent', () => {

        beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginFacebookComponent],
            imports: [
                IonicModule.forRoot(LoginFacebookComponent),
                AngularFireModule.initializeApp(environment.firebase)
            ],
            providers: [
                { provide: FirebaseProvider, useClass: FirebaseProviderMock },
                { provide: SessionProvider, useClass: SessionProviderMock },
                { provide: NativeProvider, useClass: NativeProviderMock },
                { provide: DigitalProvider, useClass: DigitalProviderMock },
                { provide: Storage, useClass: StorageMock },
                { provide: NavController, useClass: NavMock },
                { provide: NavParams, useClass: NavMock },
                { provide: AngularFireDatabase, useClass: AngularFireDatabaseMock },
                { provide: AngularFireAuth, useClass: AngularFireAuthMock },
                { provide: Facebook, useClass: FacebookMock },
                { provide: AlertController, useClass: AlertControllerMock },
                { provide: LoadingController, useClass: LoadingControllerMock }
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginFacebookComponent);
        component = fixture.componentInstance;
        session = fixture.componentRef.injector.get(SessionProvider);
        firebase = fixture.componentRef.injector.get(FirebaseProvider);
        native = fixture.componentRef.injector.get(NativeProvider);
        digital = fixture.componentRef.injector.get(DigitalProvider);
      });
    
      afterEach(() => {
        fixture.destroy();
        component = null;
        session = null;
        sessionSpy = null;
        firebase = null;
        firebaseSpy = null;
        native = null;
        nativeSpy = null;
        digital = null;
        digitalSpy = null;
        });
    
    it('should be created', () => {
        expect(component instanceof LoginFacebookComponent).toBe(true);
    });

    it('should be initialized', () => {
        expect(component.uid).toBeUndefined();
        expect(component.loader).toBeUndefined();
    });

    it('should be triggered by Login with Facebook Button', async(() => {
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#LoginWithFacebookButton'));
        el = de.nativeElement.innerHTML
        expect(el).toContain('Login with Facebook');
    }));

    it('should start loader on authentication', () => {
        expect(component.startLoader).toBeDefined();
    })

    it('should determine whether cordova or not bkefore authentication', () => {
        spyOn(component, 'viaCordova');
        component.authenticate();
        fixture.detectChanges();
        expect(component.viaCordova).toHaveBeenCalled();
    });

    it('should authenticate via cordova if platform is not browser', () => {
        spyOn(component, 'cordova');
        component.viaCordova(true);
        fixture.detectChanges();
        expect(component.cordova).toHaveBeenCalled();
    });

    it('should authenticate via browser if browser', () => {
        spyOn(component, 'browser');
        component.viaCordova(false);
        fixture.detectChanges();
        expect(component.browser).toHaveBeenCalled();
    });

    it('should request profile when checking for existing account', () => {
        spyOn(component, 'requestProfile').and.returnValue({ subscribe: () => { } })
        component.checkForExistingProfile('testUID');
        fixture.detectChanges();
        expect(component.requestProfile).toHaveBeenCalled();
    });

    it('should present alert to confirm EULA agreement', () => {
        expect(component.presentEULAA).toBeUndefined();
    });

    it('should end loader to start session with user', () => {
        spyOn(component, 'endLoader');
        spyOn(session, 'start');
        spyOn(component, 'setRootHomePage');
        let user = {
            "loggedIn": true,
            "role": 'editor',
            "uid": 'testUID'
        }
        component.welcome(user);
        fixture.detectChanges();
        expect(component.endLoader).toHaveBeenCalled();
        expect(session.start).toHaveBeenCalled();
        expect(component.setRootHomePage).toHaveBeenCalled();
    });

    it('should log error message on error', () => {
        expect(component.error).toBeUndefined();
    });

});
