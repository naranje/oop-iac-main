import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as customResources from 'aws-cdk-lib/custom-resources';

export interface ApplicationConfigStackProps extends cdk.StackProps {
    userPoolClientId: string;
    userPoolDomain: string;
    websiteBucketName: string;
    apiUrl: string;
    applicationUrl: string;
}

export class ApplicationConfigStack extends cdk.Stack {
    private s3Upload: customResources.AwsCustomResource;
    constructor(scope: Construct, id: string, props: ApplicationConfigStackProps) {
        super(scope, id, props);

        const applicationConfig = {
            itemsApi: props.apiUrl,
            serverUrl: props.applicationUrl,
            cognitoClientId: props.userPoolClientId,
            cognitoDomain: props.userPoolDomain,
            lastChanged: new Date().toUTCString(),
            region: props.env?.region,
          };
  
          const dataString = `window.AWSConfig = ${JSON.stringify(applicationConfig, null, 4)};`;
      
          const putUpdate = {
            service: 'S3',
            action: 'putObject',
            parameters: {
              Body: dataString,
              Bucket: `${props.websiteBucketName}`,
              Key: 'config.js',
            },
            physicalResourceId: customResources.PhysicalResourceId.of(`${props.websiteBucketName}`)
          };
      
          this.s3Upload = new customResources.AwsCustomResource(this, 'TodoApplicationSetConfigJS', {
            policy: customResources.AwsCustomResourcePolicy.fromSdkCalls({resources: customResources.AwsCustomResourcePolicy.ANY_RESOURCE}),
            onUpdate: putUpdate,
            onCreate: putUpdate,
          });
    }

    public dependsOn(stack: cdk.Stack){
        this.s3Upload.node.addDependency(stack);
    }
}