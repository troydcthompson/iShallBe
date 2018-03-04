import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { IonicModule, Platform, NavController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Media } from '@ionic-native/media';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { environment } from '../../environments/environment';

import { UploadComponent } from '../upload/upload';

import { } from 'jasmine';

import {
    PlatformMock,
    NavMock,
    CameraMock,
    MediaMock,
    FileMock,
    FirebaseProviderMock,
} from '../../../test-config/mocks-ionic';

describe('UploadComponent', () => {
    let fixture;
    let component;
    let platform: Platform;
    let nav: NavController;
    let camera: Camera;
    let file: File;
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
            declarations: [UploadComponent],
            imports: [
                IonicModule.forRoot(UploadComponent),
                AngularFireModule.initializeApp(environment.firebase)
            ],
            providers: [
                { provide: Platform, useClass: PlatformMock },
                { provide: NavController, useClass: NavMock },
                { provide: Camera, useClass: CameraMock },
                { provide: File, useClass: FileMock },
                { provide: Media, useClass: MediaMock },
                { provide: FirebaseProvider, useClass: FirebaseProviderMock },
                { provide: AngularFireAuth, useValue: angularFireAuthStub },
                { provide: AngularFirestore, useValue: angularFireDataStub },
            ],
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadComponent);
        component = fixture.componentInstance;
        platform = TestBed.get(Platform);
        nav = TestBed.get(NavController);
        camera = TestBed.get(Camera);
        file = TestBed.get(File);
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
        file = null;
        media = null;
        firebase = null;
        afa = null;
        afs = null;
    });

    it('should be created', () => {
        expect(component instanceof UploadComponent).toBe(true);
    });

    it('should record if content type audio', () => {
        component.contentType = "audio"
        spyOn(component, 'startRecording');
        component.ngOnInit()
        expect(component.startRecording).toHaveBeenCalled();
    });

    it('should display NowRecordingButton if recording', () => {
        component.recording = true;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#NowRecordingButton'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should display PlayAudioButton if audio ready and not playing audio', () => {
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
        component.playingAudio = true;
        fixture.detectChanges();
        let de: DebugElement;
        let el: HTMLElement;
        de = fixture.debugElement.query(By.css('#StopPlaybackButton'));
        el = de.nativeElement.src;
        expect(el).toBeUndefined();
    });

    it('should get picture via photo library if content type library', () => {
        component.contentType = "library"
        spyOn(component, 'getPicture');
        component.ngOnInit()
        expect(component.getPicture).toHaveBeenCalled();
    });

    it('should get picture via camera if content type camera', () => {
        component.contentType = "camera"
        spyOn(component, 'getPicture');
        component.ngOnInit()
        expect(component.getPicture).toHaveBeenCalled();
    });
});

