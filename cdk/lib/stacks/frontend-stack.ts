import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteBucket } from '../constructs/website-bucket-construct';
import { IWebsiteConfigurationStrategy } from '../constructs/strategies/website-configuration-strategy-interface';

export interface FrontendStackProps extends cdk.StackProps {
    readonly websiteConfigurationStrategy: IWebsiteConfigurationStrategy;
}

export class FrontendStack extends cdk.Stack {
    private readonly website: WebsiteBucket;
    private readonly websiteUrl : string;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        this.website = new WebsiteBucket(this, 'TodoApplicationWebsite', 
        {             
            indexPage: 'index.html'}, 
            props.websiteConfigurationStrategy
        );

        this.websiteUrl = props.websiteConfigurationStrategy.getWebsiteUrl();
    }

    public getWebsiteBucketName(): string {
        return this.website.getWebsiteBucketName();
    }

    public getWebsiteUrl(): string {
        return this.websiteUrl;
    }
}