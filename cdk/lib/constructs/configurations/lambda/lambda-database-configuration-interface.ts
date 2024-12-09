import { BaseLambdaConstruct } from '../../base-lambda-construct';

export interface ILambdaDatabaseConfiguration {
    configureLambdaDatabase(lambdaFunction: BaseLambdaConstruct): void;
}