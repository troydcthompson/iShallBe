import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { IonicModule, Platform, Nav, NavController } from 'ionic-angular';

import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { environment } from '../../environments/environment';

import { PostHeaderComponent } from '../post-header/post-header';

import { mockStatements } from '../../../test-data/statements/mocks';

import { } from 'jasmine';

import {
    PlatformMock,
    NavMock,
    FirebaseProviderMock,
} from '../../../test-config/mocks-ionic';

describe('PostHeaderComponent', () => {
    let fixture;
    let component;
    let platform: Platform;
    let nav: Nav;
    let navCtrl: NavController;
    let firebase: FirebaseProvider;
    let afa: AngularFireAuth;
    let afs: AngularFirestore;

    const angularFireAuthStub = {
    };

    const angularFireDataStub = {
    }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PostHeaderComponent],
            imports: [
                IonicModule.forRoot(PostHeaderComponent),
                AngularFireModule.initializeApp(environment.firebase),
            ],
            providers: [
                { provide: Platform, useClass: PlatformMock },
                { provide: Nav, useClass: NavMock },
                { provide: NavController, useClass: NavMock },
                { provide: FirebaseProvider, useClass: FirebaseProviderMock },
                { provide: AngularFireAuth, useValue: angularFireAuthStub },
                { provide: AngularFirestore, useValue: angularFireDataStub },
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PostHeaderComponent);
        component = fixture.componentInstance;
        platform = TestBed.get(Platform);
        nav = TestBed.get(Nav);
        navCtrl = TestBed.get(NavController);
        firebase = TestBed.get(FirebaseProvider);
        afa = TestBed.get(AngularFireAuth);
        afs = TestBed.get(AngularFirestore);
    });

    afterEach(() => {
        fixture.destroy();
        component = null;
        platform = null;
        nav = null;
        navCtrl = null;
        firebase = null;
        afa = null;
        afs = null;
    });

    it('should be created', () => {
        expect(component instanceof PostHeaderComponent).toBe(true);
    });

    it('should display user avatar', () => {
        component.post = mockStatements[0];
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#UserPhoto'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display post title', () => {
        component.post = mockStatements[0];
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#PostTitle'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display user name', () => {
        component.post = mockStatements[0];
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#UserName'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display timestamp', () => {
        component.post = mockStatements[0];
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#Timestamp'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });
});

