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

        // ==========================================
        // CONFIGURACION DE IPs DEL EQUIPO
        // ==========================================
        let teamAllowedIPs = [
            "191.113.76.181", // Mario
        ];
        
        if (process.env.ALLOWED_IPS) {
            teamAllowedIPs = process.env.ALLOWED_IPS.split(',').map(ip => ip.trim()).filter(Boolean);
        }

        const envName = process.env.ENV || 'dev';
        const isRestrictedEnv = envName === 'dev' || envName === 'qa';
        const allowedIPsForEnv = isRestrictedEnv ? teamAllowedIPs : [];
        const allowedIPsJson = JSON.stringify(allowedIPsForEnv);

        const routerFunction = new cloudfront.Function(this, 'LandingRouterFunction', {
            code: cloudfront.FunctionCode.fromInline(`
                function handler(event) {
                    var request = event.request;
                    var clientIP = event.viewer.ip;

                    // IPs permitidas (vacio = acceso libre)
                    var allowedIPs = ${allowedIPsJson};

                    if (allowedIPs.length > 0 && allowedIPs.indexOf(clientIP) === -1) {
                        return {
                            statusCode: 403,
                            statusDescription: 'Forbidden',
                            headers: {
                                'content-type': { value: 'text/html; charset=UTF-8' }
                            },
                            body: '<!DOCTYPE html><html><head><title>Acceso Restringido</title></head><body style="font-family: sans-serif; text-align: center; padding-top: 50px;"><h1>🚧 Sitio en Construccion 🚧</h1><p>El acceso esta restringido temporalmente.</p></body></html>'
                        };
                    }
                    
                    return request;
                }
            `),
            comment: 'Restricts IP access for lower environments',
        });

        // 3. CloudFront Distribution
        // OAC is managed automatically by S3BucketOrigin.withOriginAccessControl —
        // no need for a manual CfnOriginAccessControl (that caused duplicate OAC conflicts).
        const distribution = new cloudfront.Distribution(this, 'LandingPageDist', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
                compress: true,
                functionAssociations: [
                    {
                        function: routerFunction,
                        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                    }
                ],
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
