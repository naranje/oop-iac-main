import { IAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { ApiConstruct } from '../../api-construct';

export interface IApiAuthorizationConfiguration {
    configureApiAuthorization(api: ApiConstruct): IAuthorizer;
}