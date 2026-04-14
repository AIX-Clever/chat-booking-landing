import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LandingPageStack } from '../lib/landing-page-stack';

const app = new cdk.App();
const envName = app.node.tryGetContext('env') || process.env.ENV || 'dev';
const stackName = envName === 'prod' ? 'ChatBooking-LandingPage' : `ChatBooking-${envName}-LandingPage`;

new LandingPageStack(app, stackName, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  domainName: process.env.DOMAIN_NAME,
  certificateArn: process.env.CERTIFICATE_ARN,
});
