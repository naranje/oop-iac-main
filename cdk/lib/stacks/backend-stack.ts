import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { BackendLambdaConstruct } from '../constructs/backend-lambda-construct';
import { ApiConstruct } from '../constructs/api-construct';
import { IApiAuthorizationConfiguration } from '../constructs/configurations/api/api-authorization-configuration-interface';
import { IApiDnsConfiguration } from '../constructs/configurations/api/api-dns-configuration-interface';
import { ILambdaDatabaseConfiguration } from '../constructs/configurations/lambda/lambda-database-configuration-interface';
import { ILambdaPermissionsConfiguration } from '../constructs/configurations/lambda/lambda-permissions-configuration-interface';
import { ILambdaLayerConfiguration } from '../constructs/configurations/lambda/lambda-layer-configuration-interface';

export interface BackendStackProps extends cdk.StackProps {
     apiAuthorizationConfiguration: IApiAuthorizationConfiguration; 
     apiDnsConfiguration: IApiDnsConfiguration;
     lambdaPermissionsConfiguration: ILambdaPermissionsConfiguration;
     lambdaDatabaseConfiguration: ILambdaDatabaseConfiguration; 
     lambdaLayerConfiguration: ILambdaLayerConfiguration;
}

export class BackendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: BackendStackProps) {
        super(scope, id, props);

        const addItemLambda = new BackendLambdaConstruct(this, 'TodoApplicationAddItemFunction', {
          layerConfig: props.lambdaLayerConfiguration,
          databaseConfig: props.lambdaDatabaseConfiguration,
          permissionsConfig: props.lambdaPermissionsConfiguration,
          code: lambda.Code.fromAsset('../application/functions/add-item', {exclude: ["node_modules", "*.json"]}),
        });

        const getItemsLambda = new BackendLambdaConstruct(this, 'TodoApplicationGetItemsFunction', {
          layerConfig: props.lambdaLayerConfiguration,
          databaseConfig: props.lambdaDatabaseConfiguration,
          permissionsConfig: props.lambdaPermissionsConfiguration,
          code: lambda.Code.fromAsset('../application/functions/get-items', {exclude: ["node_modules", "*.json"]}),
        });
        
        const api = new ApiConstruct(this, 'TodoApplicationApi', {
          restApiName: 'TodoApplicationApi', 
          apiAuthorizationConfiguration: props.apiAuthorizationConfiguration, 
          apiDnsConfiguration: props.apiDnsConfiguration
        });

        api.addApiResource('item', {defaultCorsPreflightOptions: {allowOrigins: ['*'], allowMethods: ['GET', 'PUT']}});
        api.addApiAuthorizedResourceIntegration('item', 'PUT', new apigateway.LambdaIntegration(addItemLambda));
        api.addApiAuthorizedResourceIntegration('item', 'GET', new apigateway.LambdaIntegration(getItemsLambda));
    }
}