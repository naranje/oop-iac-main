import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthenticationStack } from '../stacks/authentication-stack';
import { DataStack } from '../stacks/data-stack';
import { FrontendStack } from '../stacks/frontend-stack';
import { BackendStack } from '../stacks/backend-stack';
import { ApplicationConfigStack } from '../stacks/application-config-stack';
import { DevelopmentWebsiteConfigurationStrategy } from '../constructs/strategies/development-website-configuration-strategy';
import { LambdaLayerConfiguration } from '../constructs/configurations/lambda/lambda-layer-configuration';
import { LambdaPermissionsConfiguration } from '../constructs/configurations/lambda/lambda-permissions-configuration';
import { LambdaDynamoDbDatabaseConfiguration } from '../constructs/configurations/lambda/lambda-dynamodb-configuration';
import { ApiDnsConfiguration } from '../constructs/configurations/api/api-dns-configuration';
import { ApiCognitoAuthorizationConfiguration } from '../constructs/configurations/api/api-cognito-authorization-configuration';

export interface DevelopmentStageProps extends cdk.StageProps {
    apiUrl: string;
    authenticationDomainPrefix: string;
    domainName: string;
}

export class DevelopmentStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: DevelopmentStageProps) {
        super(scope, id, props);

        const dataStack = new DataStack(this, 'DataStack');

        const frontendStack = new FrontendStack(this, 'FrontendStack', {
            websiteConfigurationStrategy: new DevelopmentWebsiteConfigurationStrategy({websiteFolder: '../application/frontend/dist/todo-application'}),
        });

        const authStack = new AuthenticationStack(this, 'AuthenticationStack', {
            authenticationDomainPrefix: props.authenticationDomainPrefix,
            applicationUrl: frontendStack.getWebsiteUrl()
        });

        const lambdaLayerConfiguration = new LambdaLayerConfiguration({
          layerName: 'TodoApplicationSharedCode',
          codePath: '../application/functions/shared-code',
          description: 'Shared code layer for the Todo application'
        });

        const lambdaPermissionsConfiguration = new LambdaPermissionsConfiguration({
          allowedOrigins: '*'
        });

        const lambdaDynamoDbConfig = new LambdaDynamoDbDatabaseConfiguration({
          dynamoDbTable: dataStack.getDatabaseTable(),
          environmentVariableName: 'TODO_ITEMS_TABLE_NAME'
        });

        const apiDnsConfiguration = new ApiDnsConfiguration({
            domainName: 'todo-api.miran.me',
            dnsRecordName: 'todo-api',
          });

        const apiAuthorizationConfig = new ApiCognitoAuthorizationConfiguration({cognitoUserPool: authStack.getUserPool()});

        const backendStack = new BackendStack(this, 'BackendStack', {
            lambdaLayerConfiguration: lambdaLayerConfiguration,
            lambdaPermissionsConfiguration: lambdaPermissionsConfiguration,
            lambdaDatabaseConfiguration: lambdaDynamoDbConfig,
            apiDnsConfiguration: apiDnsConfiguration,
            apiAuthorizationConfiguration: apiAuthorizationConfig
        });

        backendStack.addDependency(dataStack);
        backendStack.addDependency(frontendStack);
        backendStack.addDependency(authStack);

        const applicationConfig = new ApplicationConfigStack(this, 'ApplicationConfigStack', {
            userPoolClientId: authStack.getUserPoolClientId(),
            userPoolDomain: authStack.getUserPoolDomain(),
            websiteBucketName: frontendStack.getWebsiteBucketName(),
            apiUrl: props.apiUrl,
            applicationUrl: frontendStack.getWebsiteUrl()
        });
        
        applicationConfig.dependsOn(frontendStack);
        applicationConfig.dependsOn(authStack);
        applicationConfig.dependsOn(backendStack);
    }
}