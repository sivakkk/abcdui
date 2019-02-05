import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { ImageSettingsComponent } from './image-settings/image-settings.component';
import { BankSettingsComponent } from './bank-settings/bank-settings.component';
import { PaymentComponent } from './payment/payment.component';
import { ClassifyComponent } from './classify/classify.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { HeaderComponent } from './header/header.component';
import { AppService } from './app-service.service';
import { LoaderService } from './loader.service';
import { LoggerService } from './logger.service';
import { AlertService } from './alert.service';
import { LabelSettingsComponent } from './label-settings/label-settings.component';
import { InviteUsersComponent } from './invite-users/invite-users.component';
import { SimpleNotificationsModule, NotificationsService } from 'angular2-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TrainingComponent } from './training/training.component';
import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { KeysPipe } from './keys.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { FreelancerSignupComponent } from './freelancerSignup/freelancersignup.component';
import { emailVerficationComponent } from './emailVerfication/emailverfication.component';
import { LoginRouteGuard } from './login-route-guard.service';
import { DocsComponent } from './docs/docs.component';
import { HttpClientModule } from '@angular/common/http';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { NvD3Module } from 'ngx-nvd3';
import 'd3';
import 'nvd3';
import { AdminDashboardUserChartComponent } from './admin-dashboard-user-chart/admin-dashboard-user-chart.component';
import { FaqsComponent } from './faqs/faqs.component';
import { TermsandconditionsComponent } from './termsandconditions/termsandconditions.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { FreelancerLandingPageComponent } from './freelancer-landing-page/freelancer-landing-page.component';
import { AdminDashboardTeamChartComponent } from './admin-dashboard-team-chart/admin-dashboard-team-chart.component';
import { CallbackComponent } from './callback/callback.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { MyProjectComponent } from './my-project/my-project.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ProjectService } from './project.service';
import { ConfirmPasswordService } from './confirm-password.service';
import { SortSearchPipe } from './sort-search.pipe';
import { ReadInstructionSettingsComponent } from './read-instruction-settings/read-instruction-settings.component';
import { NgxEditorModule } from 'ngx-editor';
import { ViewImageComponent } from './view-image/view-image.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HowToWorkComponent } from './how-to-work/how-to-work.component';
import { GdprComplianceComponent } from './gdpr-compliance/gdpr-compliance.component';
import { BoundingBoxAnnotationComponent } from './bounding-box-annotation/bounding-box-annotation.component';
import { PolygonalAnnotationComponent } from './polygonal-annotation/polygonal-annotation.component';
import { CuboidalAnnotationComponent } from './cuboidal-annotation/cuboidal-annotation.component';
import { UcAgricultureTechComputerVisionModelComponent } from './uc-agriculture-tech-computer-vision-model/uc-agriculture-tech-computer-vision-model.component';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { FreelancerDashboardComponent } from './freelancer-dashboard/freelancer-dashboard.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MarketingComponent } from './marketing/marketing.component';
import { DicomComponent } from './dicom/dicom.component';
import { FreelancerVerifyPermalinkComponent } from './freelancer-verify-permalink/freelancer-verify-permalink.component';
import { FreelancerProfileComponent } from './freelancer-profile/freelancer-profile.component';
import { FreelancerMyProjectComponent } from './freelancer-my-project/freelancer-my-project.component';
import { FreelancerRouteGuard } from './freelancer-route-guard.service';
import { UserRouteGuard } from './user-route-guard.service';
import { FreelancerTrainingDataService } from './freelancer-training-data.service';
import { AccordionComponent } from './accordion/accordion.component';
import { PaymentStatusComponent } from './payment-status/payment-status.component';
import { UcHydrocarbonExplorationComponent } from './uc-hydrocarbon-exploration/uc-hydrocarbon-exploration.component';
import { BackOfficeComponent } from './back-office/back-office.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        SignupComponent,
        ProfileComponent,
        ImageSettingsComponent,
        BankSettingsComponent,
        PaymentComponent,
        ClassifyComponent,
        ChangePasswordComponent,
        HeaderComponent,
        LabelSettingsComponent,
        InviteUsersComponent,
        LandingPageComponent,
        VerifyEmailComponent,
        TrainingComponent,
        KeysPipe,
        FreelancerSignupComponent,
        emailVerficationComponent,
        DocsComponent,
        AdminDashboardComponent,
        AdminDashboardUserChartComponent,
        FaqsComponent,
        TermsandconditionsComponent,
        PrivacypolicyComponent,
        FreelancerLandingPageComponent,
        AdminDashboardTeamChartComponent,
        CallbackComponent,
        ProfileSettingsComponent,
        MyProjectComponent,
        ProjectSettingsComponent,
        SortSearchPipe,
        ReadInstructionSettingsComponent,
        ViewImageComponent,
        HowToWorkComponent,
        GdprComplianceComponent,
        BoundingBoxAnnotationComponent,
        PolygonalAnnotationComponent,
        CuboidalAnnotationComponent,
        UcAgricultureTechComputerVisionModelComponent,
        FreelancerDashboardComponent,
        MarketingComponent,
        DicomComponent,
        FreelancerVerifyPermalinkComponent,
        FreelancerProfileComponent,
        FreelancerMyProjectComponent,
        AccordionComponent,
        PaymentStatusComponent,
        UcHydrocarbonExplorationComponent,
        BackOfficeComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpModule,
        HttpClientModule,
        BrowserAnimationsModule,
        SimpleNotificationsModule.forRoot(),
        ScrollToModule.forRoot(),
        AngularDraggableModule,
        NgSelectModule,
        MatTooltipModule,
        MatSliderModule,
        NvD3Module,
        NgxEditorModule,
        InfiniteScrollModule,
        InternationalPhoneNumberModule,
        ColorPickerModule
    ],
    providers: [
        AppService,
        LoaderService,
        LoggerService,
        ConfirmPasswordService,
        AlertService,
        NotificationsService,
        LoginRouteGuard,
        CookieService,
        { provide: CookieOptions, useValue: {} },
        ProjectService,
        FreelancerRouteGuard,
        UserRouteGuard,
        FreelancerTrainingDataService
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
