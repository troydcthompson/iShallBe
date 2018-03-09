import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { IonicModule, Platform, NavController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { DatePicker } from '@ionic-native/date-picker';
import { Media } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';

import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { environment } from '../../environments/environment';

import { GoalCreatorPage } from '../goal-creator/goal-creator';

import { ComponentsModule } from '../../components/components.module';

import { } from 'jasmine';

import {
    PlatformMock,
    NavMock,
    CameraMock,
    DatePickerMock,
    MediaMock,
    FileMock,
    FileTransferMock,
    FirebaseProviderMock,
} from '../../../test-config/mocks-ionic';

describe('GoalCreatorPage', () => {
    let fixture;
    let component;
    let platform: Platform;
    let nav: NavController;
    let camera: Camera;
    let datePicker: DatePicker;
    let file: File;
    let fileTransfer: FileTransfer;
    let media: Media;
    let firebase: FirebaseProvider;
    let afa: AngularFireAuth;
    let afs: AngularFirestore;

    const angularFireAuthStub = {
    };

    const angularFireDataStub = {
    }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GoalCreatorPage],
            imports: [
                IonicModule.forRoot(GoalCreatorPage),
                AngularFireModule.initializeApp(environment.firebase),
                ComponentsModule
            ],
            providers: [
                { provide: Platform, useClass: PlatformMock },
                { provide: NavController, useClass: NavMock },
                { provide: Camera, useClass: CameraMock },
                { provide: DatePicker, useClass: DatePickerMock },
                { provide: File, useClass: FileMock },
                { provide: FileTransfer, useClass: FileTransferMock },
                { provide: Media, useClass: MediaMock },
                { provide: FirebaseProvider, useClass: FirebaseProviderMock },
                { provide: AngularFireAuth, useValue: angularFireAuthStub },
                { provide: AngularFirestore, useValue: angularFireDataStub },
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalCreatorPage);
        component = fixture.componentInstance;
        platform = TestBed.get(Platform);
        nav = TestBed.get(NavController);
        camera = TestBed.get(Camera);
        datePicker = TestBed.get(DatePicker);
        file = TestBed.get(File);
        fileTransfer = TestBed.get(FileTransfer);
        media = TestBed.get(Media);
        firebase = TestBed.get(FirebaseProvider);
        afa = TestBed.get(AngularFireAuth);
        afs = TestBed.get(AngularFirestore);
    });

    afterEach(() => {
        fixture.destroy();
        component = null;
        platform = null;
        nav = null;
        camera = null;
        datePicker = null;
        file = null;
        fileTransfer = null;
        media = null;
        firebase = null;
        afa = null;
        afs = null;
    });

    it('should be created', () => {
        expect(component instanceof GoalCreatorPage).toBe(true);
    });

    it('should be titled Goal', () => {
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#GoalCreatorTitle'));
        el = de.nativeElement.innerHTML;
        expect(el).toContain('Goal')
    });

    it('should display SelectDueDateButton if date not selected', () => {
        component.dateSelected = false;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#SelectDueDateButton'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display DueDateText if date selected', () => {
        component.dateSelected = true;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#DueDateText'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display SpeakItButton if audio not ready', () => {
        component.audioReady = false;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#SpeakItButton'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display upload component if recording', () => {
        component.recording = true;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('upload'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display AudioPanel if audio ready', () => {
        component.audioReady = true;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#AudioPanel'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display PlayAudioButton if not playing audio', () => {
        component.audioReady = true;
        component.playingAudio = false;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#PlayAudioButton'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display StopPlaybackButton if playing audio', () => {
        component.audioReady = true;
        component.playingAudio = true;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#StopPlaybackButton'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display form', () => {
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('form'));
        el = de.nativeElement.innerHTML
        expect(el).toContain('CREATE GOAL');
    });

});
