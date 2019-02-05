import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { ClassifyComponent } from './classify/classify.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { TrainingComponent } from './training/training.component';
import { FreelancerSignupComponent } from './freelancerSignup/freelancersignup.component';
import { emailVerficationComponent } from './emailVerfication/emailverfication.component';
import { LoginRouteGuard } from './login-route-guard.service';
import { FaqsComponent } from './faqs/faqs.component';
import { TermsandconditionsComponent } from './termsandconditions/termsandconditions.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { CallbackComponent } from './callback/callback.component';
import { FreelancerLandingPageComponent } from './freelancer-landing-page/freelancer-landing-page.component';
import { MyProjectComponent } from './my-project/my-project.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DocsComponent } from './docs/docs.component';
import { PaymentComponent } from './payment/payment.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ImageSettingsComponent } from './image-settings/image-settings.component';
import { LabelSettingsComponent } from './label-settings/label-settings.component';
import { ReadInstructionSettingsComponent } from './read-instruction-settings/read-instruction-settings.component';
import { ViewImageComponent } from './view-image/view-image.component';
import { InviteUsersComponent } from './invite-users/invite-users.component';
import { HowToWorkComponent } from './how-to-work/how-to-work.component';
import { GdprComplianceComponent } from './gdpr-compliance/gdpr-compliance.component';
import { BoundingBoxAnnotationComponent } from './bounding-box-annotation/bounding-box-annotation.component';
import { PolygonalAnnotationComponent } from './polygonal-annotation/polygonal-annotation.component';
import { CuboidalAnnotationComponent } from './cuboidal-annotation/cuboidal-annotation.component';
import { UcAgricultureTechComputerVisionModelComponent } from './uc-agriculture-tech-computer-vision-model/uc-agriculture-tech-computer-vision-model.component';
import { FreelancerDashboardComponent } from './freelancer-dashboard/freelancer-dashboard.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { DicomComponent } from './dicom/dicom.component';
import { FreelancerVerifyPermalinkComponent } from './freelancer-verify-permalink/freelancer-verify-permalink.component';
import { FreelancerProfileComponent } from './freelancer-profile/freelancer-profile.component';
import { FreelancerMyProjectComponent } from './freelancer-my-project/freelancer-my-project.component';
import { FreelancerRouteGuard } from './freelancer-route-guard.service';
import { UserRouteGuard } from './user-route-guard.service';
import { PaymentStatusComponent } from './payment-status/payment-status.component';
import { UcHydrocarbonExplorationComponent } from './uc-hydrocarbon-exploration/uc-hydrocarbon-exploration.component';

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent
    }, {
        path: 'faq',
        component: FaqsComponent
    }, {
        path: 'terms',
        component: TermsandconditionsComponent
    }, {
        path: 'privacypolicy',
        component: PrivacypolicyComponent
    }, {
        path: 'freelancer',
        component: FreelancerLandingPageComponent
    }, {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginRouteGuard]
    }, {
        path: 'login/:type',
        component: LoginComponent,
        canActivate: [LoginRouteGuard]
    }, {
        path: 'reset-password/:token',
        component: LoginComponent
    }, {
        path: 'signup',
        component: SignupComponent
    }, {
        path: 'signup/:type',
        component: SignupComponent
    },
    // {
    //     path: 'profile/:id',
    //     component: ProfileComponent
    // },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivateChild: [UserRouteGuard], // To make sure freelancer won't be able to access routes
        children: [
            { path: 'profile_settings', component: ProfileSettingsComponent },
            // { path: 'dashboard', component: FreelancerDashboardComponent },
            { path: 'my_project', component: MyProjectComponent },
            { path: 'docs', component: DocsComponent },
            { path: 'payment', component: PaymentComponent },
            { path: 'invite_users', component: InviteUsersComponent },
            { path: 'how_to_work', component: HowToWorkComponent },
            {
                path: 'projects/:id', component: ProjectSettingsComponent,
                children: [
                    { path: '', redirectTo: 'image_settings', pathMatch: 'full' },
                    { path: 'image_settings', component: ImageSettingsComponent },
                    { path: 'label_settings', component: LabelSettingsComponent },
                    { path: 'view_image', component: ViewImageComponent },
                    { path: 'invite_users', component: InviteUsersComponent },
                    { path: 'read_instruction_settings', component: ReadInstructionSettingsComponent }
                ]
            }
        ]
    }, {
        path: 'freelancer/profile',
        component: FreelancerProfileComponent,
        canActivateChild: [FreelancerRouteGuard], // To make sure that routes will be only activated for freelancer
        children: [
            { path: '', redirectTo: 'my_project', pathMatch: 'full' },
            { path: 'dashboard', component: FreelancerDashboardComponent },
            { path: 'my_project', component: FreelancerMyProjectComponent },
            { path: 'docs', component: DocsComponent },
            { path: 'payment', component: PaymentComponent },
            { path: 'how_to_work', component: HowToWorkComponent }
        ]
    }, {
        path: 'classify/:id',
        component: ClassifyComponent
    }, {
        path: 'classify',
        component: ClassifyComponent
    }, {
        path: 'classify/:id/:type',
        component: ClassifyComponent
    }, {
        path: 'verify/:userType/:permalink/:verifyToken',
        component: VerifyEmailComponent
    }, {
        path: 'freelancer/training',
        component: TrainingComponent
    }, {
        path: 'freelancer/login',
        component: FreelancerSignupComponent,
        canActivate: [LoginRouteGuard]
    }, {
        path: 'freelancer/signup',
        component: FreelancerSignupComponent,
    }, {
        path: 'verify-email',
        component: emailVerficationComponent
    }, {
        path: 'callback/:type',
        component: CallbackComponent
    }, {
        path: 'freelancer/verify_permalink/:projectId/:permalink/:freelancerId',
        component: FreelancerVerifyPermalinkComponent
    }, {
        path: 'gdpr-compliance',
        component: GdprComplianceComponent
    }, {
        path: 'bounding-box-annotation',
        component: BoundingBoxAnnotationComponent
    }, {
        path: 'polygonal-annotation',
        component: PolygonalAnnotationComponent
    }, {
        path: '3d-cuboid-annotation',
        component: CuboidalAnnotationComponent
    }, {
        path: 'agriculture-tech-computer-vision-model',
        component: UcAgricultureTechComputerVisionModelComponent
    }, {
        path: 'oil-and-gas-computer-vision-model',
        component: UcHydrocarbonExplorationComponent
    }, {
        path: 'dicom',
        component: DicomComponent
    }, {
        path: 'backoffice',
        component: BackOfficeComponent
    }, {
        path: 'payment-status/:source/:status/:type',
        component: PaymentStatusComponent
    }, {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
