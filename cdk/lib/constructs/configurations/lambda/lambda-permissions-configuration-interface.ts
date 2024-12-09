import { BaseLambdaConstruct } from '../../base-lambda-construct';

export interface ILambdaPermissionsConfiguration {
    configureLambdaPermissions(lambdaFunction: BaseLambdaConstruct): void;
}