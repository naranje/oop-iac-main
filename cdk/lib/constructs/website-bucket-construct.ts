import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { IWebsiteConfigurationStrategy } from './strategies/website-configuration-strategy-interface';

export interface BaseWebsiteBucketConstructProps {
    readonly indexPage:string,
    readonly errorPage?:string,
}

export class WebsiteBucket extends s3.Bucket {

    private readonly websiteIndexPage: string;
    private readonly websiteErrorPage?: string;
    
    constructor(scope: Construct, id: string, props:BaseWebsiteBucketConstructProps, websiteConfigurationStrategy: IWebsiteConfigurationStrategy) {

        super(scope, id, {
            websiteIndexDocument: props.indexPage,
            websiteErrorDocument: props.errorPage,
            publicReadAccess: false,
            });

            this.websiteIndexPage = props.indexPage;
            this.websiteErrorPage = props.errorPage;

        websiteConfigurationStrategy.configureWebsite(this);
    }

    public getWebsiteBucketName(): string {
        return this.bucketName;
    }

    public getWebsiteIndexPage(): string {
        return this.websiteIndexPage;
    }

    public getWebsiteErrorPage(): string | undefined {
        return this.websiteErrorPage;
    }
}