import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LandingPageStack } from '../lib/landing-page-stack';

const app = new cdk.App();
new LandingPageStack(app, 'ChatBooking-LandingPage', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
