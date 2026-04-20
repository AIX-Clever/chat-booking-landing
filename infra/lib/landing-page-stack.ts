import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LandingPageStackProps extends cdk.StackProps {
    domainName?: string;
    certificateArn?: string;
}

export class LandingPageStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: LandingPageStackProps) {
        super(scope, id, props);

        // 1. S3 Bucket for hosting
        const siteBucket = new s3.Bucket(this, 'LandingPageBucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [{
                allowedMethods: [s3.HttpMethods.GET],
                allowedOrigins: ['*'],
                allowedHeaders: ['*'],
            }]
        });

        // 2. Setup Certificate if provided
        let certificate: cdk.aws_certificatemanager.ICertificate | undefined;
        let domainNames: string[] | undefined;

        if (props?.domainName && props?.certificateArn) {
            certificate = cdk.aws_certificatemanager.Certificate.fromCertificateArn(
                this,
                'LandingCertificate',
                props.certificateArn
            );
            domainNames = [props.domainName];
        }

        // 3. CloudFront Distribution
        // OAC is managed automatically by S3BucketOrigin.withOriginAccessControl —
        // no need for a manual CfnOriginAccessControl (that caused duplicate OAC conflicts).
        const distribution = new cloudfront.Distribution(this, 'LandingPageDist', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
                compress: true,
            },
            domainNames: domainNames,
            certificate: certificate,
            defaultRootObject: 'index.html',
            enableLogging: true,
            enableIpv6: true,
            httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
            comment: `Landing App (${process.env.ENV || 'dev'})`,
        });

        // 4. Deploy site contents
        new s3deploy.BucketDeployment(this, 'DeployLandingPage', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
            destinationBucket: siteBucket,
            distribution: distribution,
            distributionPaths: ['/*'],
        });

        // Outputs
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });
        new cdk.CfnOutput(this, 'CustomDomain', {
            value: props?.domainName ?? 'none',
        });
    }
}
