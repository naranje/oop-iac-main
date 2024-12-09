import { WebsiteBucket } from "../website-bucket-construct";
import { IWebsiteConfigurationStrategy } from "./website-configuration-strategy-interface";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Role } from 'aws-cdk-lib/aws-iam';
import { DnsValidatedCertificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontWebDistribution, OriginAccessIdentity, ViewerCertificate, SSLMethod, SecurityPolicyProtocol } from 'aws-cdk-lib/aws-cloudfront';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface ProductionWebsiteConfigurationStrategyProps {
    readonly websiteFolder: string,
    readonly domainName: string,
    readonly subdomain?: string,
    readonly role?: Role,
    readonly sslMethod?: SSLMethod,
    readonly securityPolicy?: SecurityPolicyProtocol,
}

export class ProductionWebsiteConfigurationStrategy implements IWebsiteConfigurationStrategy {
    private readonly websiteConfig: ProductionWebsiteConfigurationStrategyProps;
    private readonly domainName: string;
    private readonly subdomain?: string;    
    private hostedZone: route53.IHostedZone;
    private cert?: ICertificate;

    constructor(props: ProductionWebsiteConfigurationStrategyProps) {
        this.websiteConfig = props;
        this.domainName = props.domainName;
        this.subdomain = props.subdomain;
    }
    
    public configureWebsite(websiteBucket: WebsiteBucket): void {
  
        this.hostedZone = route53.HostedZone.fromLookup(websiteBucket.stack, 'ApplicationHostedZone', {
            domainName: this.domainName
        });

        const domainName = this.subdomain ? `${this.subdomain}.${this.hostedZone.zoneName}` : this.hostedZone.zoneName;
        
        this.cert = new DnsValidatedCertificate(websiteBucket.stack, 'Certificate', {
          hostedZone: this.hostedZone,
          domainName,
          region: 'us-west-2',
          subjectAlternativeNames: ['*.' + domainName],
        });

        const accessIdentity = new OriginAccessIdentity(websiteBucket.stack, 'OriginAccessIdentity', { comment: `${websiteBucket.bucketName}-access-identity` });
        const distribution = new CloudFrontWebDistribution(websiteBucket.stack, 'cloudfrontDistribution', this.getCloudFrontConfiguration(websiteBucket, this.websiteConfig, accessIdentity, this.cert));
  
        new s3deploy.BucketDeployment(websiteBucket.stack, 'BucketDeployment', {
          sources: [s3deploy.Source.asset(this.websiteConfig.websiteFolder)],
          destinationBucket: websiteBucket,
          distribution: distribution,
          role: this.websiteConfig.role,
          distributionPaths: ['/', `/${websiteBucket.getWebsiteIndexPage()}`],
        });
  
        new ARecord(websiteBucket.stack, 'Alias', {
          zone: this.hostedZone,
          recordName: 'todo',
          target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
  
        if (!this.websiteConfig.subdomain) {
          new HttpsRedirect(websiteBucket.stack, 'Redirect', {
              zone: this.hostedZone,
              recordNames: [`www.${this.hostedZone}}`],
              targetDomain: this.hostedZone.zoneName,
          });          
        }
    }

    private getCloudFrontConfiguration(websiteBucket:WebsiteBucket, config:ProductionWebsiteConfigurationStrategyProps, accessIdentity: OriginAccessIdentity, cert?:ICertificate) {
        const cloudFrontConfig:any = {
            originConfigs: [
            {
                s3OriginSource: {
                s3BucketSource: websiteBucket,
                originAccessIdentity: accessIdentity,
                },
                behaviors: [{ isDefaultBehavior: true }],
            },
            ],
            
            //Angular requires that all unknown routes be redirected to index.html
            errorConfigurations: [{
            errorCode: 403,
            responsePagePath: (websiteBucket.getWebsiteErrorPage() ? `/${websiteBucket.getWebsiteErrorPage()}` : `/${websiteBucket.getWebsiteIndexPage()}`),
            responseCode: 200,
            },
            {
            errorCode: 404,
            responsePagePath: (websiteBucket.getWebsiteErrorPage() ? `/${websiteBucket.getWebsiteErrorPage()}` : `/${websiteBucket.getWebsiteIndexPage()}`),
            responseCode: 200,
            }],
        };

        if (typeof config.sslMethod !== 'undefined') {
            cloudFrontConfig.aliasConfiguration.sslMethod = config.sslMethod;
        }

        if (typeof config.securityPolicy !== 'undefined') {
            cloudFrontConfig.aliasConfiguration.securityPolicy = config.securityPolicy;
        }

        if (typeof this.hostedZone.zoneName !== 'undefined' && typeof cert !== 'undefined') {
            cloudFrontConfig.viewerCertificate = ViewerCertificate.fromAcmCertificate(cert, 
            {
            aliases: [config.subdomain ? `${config.subdomain}.${this.hostedZone.zoneName}` : this.hostedZone.zoneName],
            });
            cloudFrontConfig.viewerCertificate.sslSupportMethod = config.sslMethod ? config.sslMethod : SSLMethod.SNI;
            cloudFrontConfig.viewerCertificate.securityPolicy = config.securityPolicy ? config.securityPolicy : SecurityPolicyProtocol.TLS_V1_2_2021;
        }

        return cloudFrontConfig;
    }

    public getWebsiteUrl(): string {
        return `https://${this.websiteConfig.subdomain ? `${this.websiteConfig.subdomain}.${this.hostedZone.zoneName}` : this.hostedZone.zoneName}`;
    }
}