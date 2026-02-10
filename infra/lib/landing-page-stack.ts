import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class LandingPageStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. S3 Bucket for hosting
        const siteBucket = new s3.Bucket(this, 'LandingPageBucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For demo/dev
            autoDeleteObjects: true, // For demo/dev
            cors: [{
                allowedMethods: [s3.HttpMethods.GET],
                allowedOrigins: ['*'],
                allowedHeaders: ['*'],
            }]
        });

        // 2. Create Origin Access Control (OAC)
        const oac = new cloudfront.CfnOriginAccessControl(this, 'LandingPageOAC', {
            originAccessControlConfig: {
                name: `LandingPageOAC-${this.node.addr}`, // Unique name
                originAccessControlOriginType: 's3',
                signingBehavior: 'always',
                signingProtocol: 'sigv4',
            },
        });

        // 3. CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'LandingPageDist', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket, {
                    originAccessControlId: oac.attrId
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
                compress: true,
            },
            defaultRootObject: 'index.html',
            enableLogging: true, // Good practice
            enableIpv6: true,
            httpVersion: cloudfront.HttpVersion.HTTP2_AND_3, // Modern perf
        });

        // 4. Add Bucket Policy for OAC
        siteBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`
                }
            }
        }));

        // 5. Deploy site contents
        new s3deploy.BucketDeployment(this, 'DeployLandingPage', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))], // Deploy build output
            destinationBucket: siteBucket,
            distribution: distribution,
            distributionPaths: ['/*'],
        });

        // Outputs
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });
    }
}
