import { WebsiteBucket } from "../website-bucket-construct";
import { IWebsiteConfigurationStrategy } from "./website-configuration-strategy-interface";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Role } from 'aws-cdk-lib/aws-iam';

export interface DevelopmentWebsiteConfigurationStrategyProps {
    readonly websiteFolder: string,
    readonly role?: Role,
}

export class DevelopmentWebsiteConfigurationStrategy implements IWebsiteConfigurationStrategy {
    private readonly websiteFolder: string;
    private readonly role?: Role;
    private websiteUrl: string;

    constructor(props: DevelopmentWebsiteConfigurationStrategyProps) {
        this.websiteFolder = props.websiteFolder;
        this.role = props.role;
    }
    
    public configureWebsite(websiteBucket: WebsiteBucket): void {
        new s3deploy.BucketDeployment(websiteBucket.stack, 'BucketDeployment', {
            sources: [s3deploy.Source.asset(this.websiteFolder)],
            destinationBucket: websiteBucket,
            role: this.role,
          });
        
          this.websiteUrl = websiteBucket.bucketWebsiteUrl;
    }

    public getWebsiteUrl(): string {
        return this.websiteUrl;
    }
}