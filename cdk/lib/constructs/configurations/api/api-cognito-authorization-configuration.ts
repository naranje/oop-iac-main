import { IApiAuthorizationConfiguration } from './api-authorization-configuration-interface';
import { ApiConstruct } from '../../api-construct';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface ApiCognitoAuthorizationConfigurationProps {
    cognitoUserPool: cognito.IUserPool;
}

export class ApiCognitoAuthorizationConfiguration implements IApiAuthorizationConfiguration {
    private readonly cognitoUserPool: cognito.IUserPool;
    constructor(props: ApiCognitoAuthorizationConfigurationProps) {
        this.cognitoUserPool = props.cognitoUserPool;
    }

    public configureApiAuthorization(api: ApiConstruct): apigateway.IAuthorizer {
        return new apigateway.CognitoUserPoolsAuthorizer(api, 'CognitoAuthorizer', {
            cognitoUserPools: [this.cognitoUserPool]
          });
    }
}